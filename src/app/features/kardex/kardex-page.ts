import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AlmacenService } from '../catalogos/almacen.service';
import { AlmacenResponse } from '../catalogos/catalogos.models';
import { ProductoService } from '../productos/producto.service';
import { ProductoResumen } from '../productos/producto.models';
import { KardexService } from './kardex.service';
import { KardexResponse, TIPO_KARDEX_LABEL } from './kardex.models';

/** Historial de movimientos de un producto en un almacén, más su stock actual. */
@Component({
  selector: 'app-kardex-page',
  imports: [DecimalPipe, FormsModule, NzSelectModule, NzTableModule, NzTagModule],
  templateUrl: './kardex-page.html',
  styleUrl: './kardex-page.scss',
})
export class KardexPage implements OnInit {
  private readonly kardexService = inject(KardexService);
  private readonly almacenService = inject(AlmacenService);
  private readonly productoService = inject(ProductoService);

  protected readonly tipoLabel = TIPO_KARDEX_LABEL;

  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly productos = signal<ProductoResumen[]>([]);

  protected readonly almacenId = signal<number | null>(null);
  protected readonly productoId = signal<number | null>(null);

  protected readonly movimientos = signal<KardexResponse[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly stockActual = signal<number | null>(null);

  private pagina = 0;
  private tamano = 20;

  ngOnInit(): void {
    this.almacenService.listar().subscribe((r) => this.almacenes.set(r));
    this.productoService.listar(null, 0, 200).subscribe((r) => this.productos.set(r.content));
  }

  buscar(): void {
    this.pagina = 0;
    this.cargar();
  }

  cambiarPagina(evento: NzTableQueryParams): void {
    this.pagina = evento.pageIndex - 1;
    this.tamano = evento.pageSize;
    this.cargar();
  }

  private cargar(): void {
    const almacenId = this.almacenId();
    const productoId = this.productoId();
    if (!almacenId || !productoId) {
      return;
    }

    this.cargando.set(true);
    this.kardexService.listar(almacenId, productoId, this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.movimientos.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });

    this.kardexService.consultarStockDeAlmacen(almacenId).subscribe({
      next: (filas) => {
        const fila = filas.find((f) => f.productoId === productoId);
        this.stockActual.set(fila?.cantidadActual ?? 0);
      },
      error: () => this.stockActual.set(null),
    });
  }
}
