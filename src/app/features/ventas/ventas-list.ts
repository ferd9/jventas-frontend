import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeError } from '../../core/http/error-message';
import { ESTADO_TRANSACCION_COLOR, ESTADO_TRANSACCION_LABEL } from '../../core/models/estado-transaccion';
import { MetodoPagoService } from '../catalogos/metodo-pago.service';
import { MetodoPagoResponse } from '../catalogos/catalogos.models';
import { ClienteService } from '../clientes/cliente.service';
import { ClienteResponse } from '../clientes/cliente.models';
import { PagoService } from '../pagos/pago.service';
import { PagoRequest, PagoResponse, SaldoResponse } from '../pagos/pago.models';
import { DevolucionService } from './devolucion.service';
import { DevolucionRequest, DevolucionResponse } from './devolucion.models';
import { VentaService } from './venta.service';
import { VentaDetalleResponse, VentaResumenResponse } from './venta.models';

@Component({
  selector: 'app-ventas-list',
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NzButtonModule,
    NzCheckboxModule,
    NzDrawerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './ventas-list.html',
  styleUrl: './ventas-list.scss',
})
export class VentasList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly devolucionService = inject(DevolucionService);
  private readonly pagoService = inject(PagoService);
  private readonly metodoPagoService = inject(MetodoPagoService);
  protected readonly authService = inject(AuthService);

  protected readonly estadoLabel = ESTADO_TRANSACCION_LABEL;
  protected readonly estadoColor = ESTADO_TRANSACCION_COLOR;

  protected readonly ventas = signal<VentaResumenResponse[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly clientes = signal<ClienteResponse[]>([]);

  protected readonly clienteId = signal<number | null>(null);
  protected readonly fechaDesde = signal<string | null>(null);
  protected readonly fechaHasta = signal<string | null>(null);

  protected readonly drawerVisible = signal(false);
  protected readonly drawerCargando = signal(false);
  protected readonly ventaSeleccionada = signal<VentaDetalleResponse | null>(null);
  protected readonly errorAnular = signal<string | null>(null);
  protected readonly devoluciones = signal<DevolucionResponse[]>([]);

  protected readonly devolucionModalVisible = signal(false);
  protected readonly devolucionGuardando = signal(false);
  protected readonly devolucionError = signal<string | null>(null);
  protected readonly devolucionMotivo = this.fb.nonNullable.control('');
  protected readonly devolucionLineas = this.fb.array<ReturnType<typeof this.crearFilaDevolucion>>([]);

  protected readonly saldo = signal<SaldoResponse | null>(null);
  protected readonly pagos = signal<PagoResponse[]>([]);
  protected readonly metodosPago = signal<MetodoPagoResponse[]>([]);
  protected readonly pagoModalVisible = signal(false);
  protected readonly pagoGuardando = signal(false);
  protected readonly pagoError = signal<string | null>(null);
  protected readonly pagoFormulario = this.fb.nonNullable.group({
    metodoPagoId: [null as number | null],
    monto: [0],
    referencia: [''],
  });

  private pagina = 0;
  private tamano = 20;

  ngOnInit(): void {
    this.clienteService.listar(null, 0, 100).subscribe((respuesta) => this.clientes.set(respuesta.content));
    this.metodoPagoService.listar().subscribe((r) => this.metodosPago.set(r));
    this.cargar();
  }

  filtrar(): void {
    this.pagina = 0;
    this.cargar();
  }

  cambiarPagina(evento: NzTableQueryParams): void {
    this.pagina = evento.pageIndex - 1;
    this.tamano = evento.pageSize;
    this.cargar();
  }

  verDetalle(venta: VentaResumenResponse): void {
    this.drawerVisible.set(true);
    this.drawerCargando.set(true);
    this.errorAnular.set(null);
    this.ventaService.obtener(venta.id).subscribe({
      next: (detalle) => {
        this.ventaSeleccionada.set(detalle);
        this.drawerCargando.set(false);
      },
      error: () => this.drawerCargando.set(false),
    });
    this.devolucionService.listar(venta.id).subscribe((r) => this.devoluciones.set(r));
    this.pagoService.saldoDeVenta(venta.id).subscribe((r) => this.saldo.set(r));
    this.pagoService.listarPorVenta(venta.id).subscribe((r) => this.pagos.set(r));
  }

  cerrarDrawer(): void {
    this.drawerVisible.set(false);
    this.ventaSeleccionada.set(null);
    this.devoluciones.set([]);
    this.saldo.set(null);
    this.pagos.set([]);
  }

  anular(venta: VentaDetalleResponse): void {
    this.errorAnular.set(null);
    this.ventaService.anular(venta.id).subscribe({
      next: (actualizada) => {
        this.ventaSeleccionada.set(actualizada);
        this.cargar();
      },
      error: (err) => this.errorAnular.set(mensajeError(err, 'No se pudo anular la venta')),
    });
  }

  abrirDevolucion(): void {
    const venta = this.ventaSeleccionada();
    if (!venta) {
      return;
    }
    this.devolucionError.set(null);
    this.devolucionMotivo.setValue('');
    this.devolucionLineas.clear();
    for (const linea of venta.detalles) {
      this.devolucionLineas.push(this.crearFilaDevolucion(linea.id, linea.productoNombre, linea.cantidad));
    }
    this.devolucionModalVisible.set(true);
  }

  cancelarDevolucion(): void {
    this.devolucionModalVisible.set(false);
  }

  guardarDevolucion(): void {
    const venta = this.ventaSeleccionada();
    if (!venta) {
      return;
    }

    const lineas = this.devolucionLineas.controls
      .filter((fila) => fila.controls.incluir.value && fila.controls.cantidad.value > 0)
      .map((fila) => ({
        detalleVentaId: fila.controls.detalleVentaId.value,
        cantidad: fila.controls.cantidad.value,
        numerosSerie: this.parsearSeries(fila.controls.numerosSerieTexto.value),
      }));

    if (lineas.length === 0) {
      this.devolucionError.set('Marca al menos una línea con cantidad mayor a cero');
      return;
    }

    this.devolucionGuardando.set(true);
    this.devolucionError.set(null);

    const payload: DevolucionRequest = { motivo: this.devolucionMotivo.value.trim() || null, lineas };
    this.devolucionService.registrar(venta.id, payload).subscribe({
      next: () => {
        this.devolucionGuardando.set(false);
        this.devolucionModalVisible.set(false);
        this.verDetalle(venta);
        this.cargar();
      },
      error: (err) => {
        this.devolucionError.set(mensajeError(err, 'No se pudo registrar la devolución'));
        this.devolucionGuardando.set(false);
      },
    });
  }

  abrirPago(): void {
    this.pagoError.set(null);
    this.pagoFormulario.reset({ metodoPagoId: null, monto: this.saldo()?.saldo ?? 0, referencia: '' });
    this.pagoModalVisible.set(true);
  }

  cancelarPago(): void {
    this.pagoModalVisible.set(false);
  }

  guardarPago(): void {
    const venta = this.ventaSeleccionada();
    const valores = this.pagoFormulario.getRawValue();
    if (!venta || !valores.metodoPagoId || valores.monto <= 0) {
      this.pagoError.set('Selecciona un método de pago e ingresa un monto mayor a cero');
      return;
    }

    this.pagoGuardando.set(true);
    this.pagoError.set(null);

    const payload: PagoRequest = {
      ventaId: venta.id,
      metodoPagoId: valores.metodoPagoId,
      monto: valores.monto,
      referencia: valores.referencia.trim() || null,
    };
    this.pagoService.registrar(payload).subscribe({
      next: () => {
        this.pagoGuardando.set(false);
        this.pagoModalVisible.set(false);
        // el pago puede haber saldado la venta -- el backend pasa el estado a CANCELADO solo
        // ahí, así que hay que releer la venta completa, no solo el saldo/la lista de pagos
        this.ventaService.obtener(venta.id).subscribe((detalle) => this.ventaSeleccionada.set(detalle));
        this.pagoService.saldoDeVenta(venta.id).subscribe((r) => this.saldo.set(r));
        this.pagoService.listarPorVenta(venta.id).subscribe((r) => this.pagos.set(r));
        this.cargar();
      },
      error: (err) => {
        this.pagoError.set(mensajeError(err, 'No se pudo registrar el pago'));
        this.pagoGuardando.set(false);
      },
    });
  }

  private parsearSeries(texto: string): string[] | null {
    const series = texto
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return series.length > 0 ? series : null;
  }

  private crearFilaDevolucion(detalleVentaId: number, productoNombre: string, cantidadOriginal: number) {
    return this.fb.nonNullable.group({
      detalleVentaId: this.fb.nonNullable.control(detalleVentaId),
      productoNombre: this.fb.nonNullable.control(productoNombre),
      cantidadOriginal: this.fb.nonNullable.control(cantidadOriginal),
      incluir: this.fb.nonNullable.control(false),
      cantidad: this.fb.nonNullable.control(cantidadOriginal),
      numerosSerieTexto: this.fb.nonNullable.control(''),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.ventaService.listar(this.clienteId(), this.fechaDesde(), this.fechaHasta(), this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.ventas.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
