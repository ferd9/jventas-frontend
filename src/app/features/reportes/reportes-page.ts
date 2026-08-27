import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../core/auth/auth.service';
import { AlmacenStockResponse } from '../kardex/kardex.models';
import { KardexService } from '../kardex/kardex.service';
import { ProductoService } from '../productos/producto.service';
import { ReporteService } from './reporte.service';
import { CuentaPorCobrarResponse, CuentaPorPagarResponse } from './reporte.models';

/** Solo lo que ya se pagó vía Pagos se descuenta -- una venta/compra sin ningún pago aparece con saldo = total. */
@Component({
  selector: 'app-reportes-page',
  imports: [DatePipe, DecimalPipe, NzTableModule, NzTabsModule, NzTagModule],
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.scss',
})
export class ReportesPage implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly kardexService = inject(KardexService);
  private readonly productoService = inject(ProductoService);
  protected readonly authService = inject(AuthService);

  protected readonly cuentasPorCobrar = signal<CuentaPorCobrarResponse[]>([]);
  protected readonly cuentasPorPagar = signal<CuentaPorPagarResponse[]>([]);
  protected readonly stockBajoMinimo = signal<AlmacenStockResponse[]>([]);
  protected readonly cargandoCobrar = signal(false);
  protected readonly cargandoPagar = signal(false);
  protected readonly cargandoStock = signal(false);

  /** GET /api/stock/bajo-minimo no trae el stockMinimo en sí (solo compara internamente) -- se pide aparte por producto y se cachea acá. */
  protected readonly stockMinimoPorProducto = signal<Map<number, number>>(new Map());

  ngOnInit(): void {
    if (this.authService.tienePermiso('venta:ver')) {
      this.cargandoCobrar.set(true);
      this.reporteService.cuentasPorCobrar().subscribe({
        next: (r) => {
          this.cuentasPorCobrar.set(r);
          this.cargandoCobrar.set(false);
        },
        error: () => this.cargandoCobrar.set(false),
      });
    }
    if (this.authService.tienePermiso('compra:ver')) {
      this.cargandoPagar.set(true);
      this.reporteService.cuentasPorPagar().subscribe({
        next: (r) => {
          this.cuentasPorPagar.set(r);
          this.cargandoPagar.set(false);
        },
        error: () => this.cargandoPagar.set(false),
      });
    }
    if (this.authService.tienePermiso('stock:ver')) {
      this.cargandoStock.set(true);
      this.kardexService.bajoElMinimo().subscribe({
        next: (r) => {
          this.stockBajoMinimo.set(r);
          this.cargandoStock.set(false);
          this.cargarStockMinimoDeProductos(r);
        },
        error: () => this.cargandoStock.set(false),
      });
    }
  }

  totalSaldoCobrar(): number {
    return this.cuentasPorCobrar().reduce((suma, c) => suma + c.saldo, 0);
  }

  totalSaldoPagar(): number {
    return this.cuentasPorPagar().reduce((suma, c) => suma + c.saldo, 0);
  }

  stockMinimoDe(productoId: number): number | null {
    return this.stockMinimoPorProducto().get(productoId) ?? null;
  }

  private cargarStockMinimoDeProductos(filas: AlmacenStockResponse[]): void {
    const idsUnicos = [...new Set(filas.map((f) => f.productoId))];
    for (const id of idsUnicos) {
      this.productoService.obtener(id).subscribe((detalle) => {
        this.stockMinimoPorProducto.update((mapa) => new Map(mapa).set(id, detalle.stockMinimo));
      });
    }
  }
}
