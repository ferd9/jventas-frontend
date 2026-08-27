import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { mensajeError } from '../../core/http/error-message';
import { AlmacenService } from '../catalogos/almacen.service';
import { CategoriaService } from '../catalogos/categoria.service';
import {
  AlmacenResponse,
  CategoriaResponse,
  ImpuestoResponse,
  MonedaResponse,
  SerieDocumentoResponse,
  TipoDocumentoResponse,
} from '../catalogos/catalogos.models';
import { ImpuestoService } from '../catalogos/impuesto.service';
import { MonedaService } from '../catalogos/moneda.service';
import { SerieDocumentoService } from '../catalogos/serie-documento.service';
import { TipoDocumentoService } from '../catalogos/tipo-documento.service';
import { ClienteService } from '../clientes/cliente.service';
import { ClienteResponse } from '../clientes/cliente.models';
import { ProductoService } from '../productos/producto.service';
import { ProductoDetalle, ProductoResumen } from '../productos/producto.models';
import { SerieProductoService } from './serie-producto.service';
import { SerieProductoResponse } from './serie-producto.models';
import { VentaService } from './venta.service';
import { VentaRequest } from './venta.models';

/** Igual a la fórmula real de VentaService.crear() -- solo para feedback visual, el backend recalcula todo igual. */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

@Component({
  selector: 'app-venta-form',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
  ],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.scss',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly almacenService = inject(AlmacenService);
  private readonly monedaService = inject(MonedaService);
  private readonly tipoDocumentoService = inject(TipoDocumentoService);
  private readonly serieDocumentoService = inject(SerieDocumentoService);
  private readonly impuestoService = inject(ImpuestoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly serieProductoService = inject(SerieProductoService);
  private readonly router = inject(Router);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly clientes = signal<ClienteResponse[]>([]);
  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly monedas = signal<MonedaResponse[]>([]);
  protected readonly tiposDocumento = signal<TipoDocumentoResponse[]>([]);
  protected readonly impuestos = signal<ImpuestoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly productos = signal<ProductoResumen[]>([]);

  /** Series disponibles por fila -- no es parte del formulario, solo alimenta las opciones de cada nz-select. */
  protected readonly seriesDisponiblesPorFila = signal<SerieProductoResponse[][]>([[]]);
  /** Series de DOCUMENTO (numeración correlativa) para el almacén + tipo de documento de la cabecera -- no confundir con seriesDisponiblesPorFila. */
  protected readonly series = signal<SerieDocumentoResponse[]>([]);

  private readonly cacheProductoDetalle = new Map<number, ProductoDetalle>();

  protected readonly formulario = this.fb.nonNullable.group({
    tipoDocumentoId: [null as number | null, Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.maxLength(20)]],
    serieDocumentoId: [null as number | null],
    clienteId: [null as number | null, Validators.required],
    almacenId: [null as number | null, Validators.required],
    monedaId: [null as number | null, Validators.required],
    fechaVencimiento: [''],
    observaciones: [''],
    detalles: this.fb.array([this.crearFilaDetalle(0)]),
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    this.formulario.controls.almacenId.valueChanges.subscribe(() => this.alCambiarAlmacen());
    // formControlName no dispara (ngModelChange) -- eso es de NgModel a secas. Para reaccionar a cambios
    // en un FormGroup reactivo hay que suscribirse a valueChanges del control en sí.
    this.formulario.controls.almacenId.valueChanges.subscribe(() => this.recargarSeriesDocumento());
    this.formulario.controls.tipoDocumentoId.valueChanges.subscribe(() => this.recargarSeriesDocumento());
    this.formulario.controls.serieDocumentoId.valueChanges.subscribe((id) => this.alCambiarSerieDocumento(id));
  }

  get detalles(): FormArray {
    return this.formulario.controls.detalles;
  }

  agregarFila(): void {
    this.detalles.push(this.crearFilaDetalle(this.detalles.length));
    this.seriesDisponiblesPorFila.update((filas) => [...filas, []]);
  }

  quitarFila(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
      this.seriesDisponiblesPorFila.update((filas) => filas.filter((_, i) => i !== index));
    }
  }

  alCambiarAlmacen(): void {
    // el almacén es a nivel de cabecera -- si cambia, las series disponibles de toda línea con serie quedan obsoletas
    this.detalles.controls.forEach((_, index) => this.refrescarSeriesDisponibles(index));
  }

  alCambiarProducto(index: number): void {
    const fila = this.detalles.at(index);
    const productoId = fila.get('productoId')!.value as number | null;
    fila.patchValue({ numerosSerie: [] });
    if (!productoId) {
      fila.patchValue({ requiereSerie: false });
      this.setSeriesDisponibles(index, []);
      return;
    }

    const cacheado = this.cacheProductoDetalle.get(productoId);
    if (cacheado) {
      this.aplicarRequiereSerie(index, cacheado);
      return;
    }
    this.productoService.obtener(productoId).subscribe((detalle) => {
      this.cacheProductoDetalle.set(productoId, detalle);
      this.aplicarRequiereSerie(index, detalle);
    });
  }

  /** Igual a la fórmula real de VentaService.crear() -- solo para feedback visual, el backend recalcula todo igual. */
  calcularLinea(index: number): { subtotal: number; montoImpuesto: number; total: number } {
    const fila = this.detalles.at(index).getRawValue() as {
      cantidad: number;
      precioUnitario: number;
      descuentoPct: number | null;
      impuestoId: number | null;
    };
    const descuento = fila.descuentoPct ?? 0;
    const factor = 1 - descuento / 100;
    const subtotal = redondear(fila.precioUnitario * fila.cantidad * factor);
    const impuesto = fila.impuestoId ? this.impuestos().find((i) => i.id === fila.impuestoId) : null;
    const montoImpuesto = impuesto ? redondear((subtotal * impuesto.tasa) / 100) : 0;
    return { subtotal, montoImpuesto, total: redondear(subtotal + montoImpuesto) };
  }

  totalGeneral(): number {
    return redondear(this.detalles.controls.reduce((suma, _, i) => suma + this.calcularLinea(i).total, 0));
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    const filaConSerieIncompleta = valores.detalles.findIndex(
      (d) => d.requiereSerie && d.numerosSerie.length !== d.cantidad,
    );
    if (filaConSerieIncompleta !== -1) {
      this.error.set(
        `La línea ${filaConSerieIncompleta + 1} necesita elegir exactamente ${valores.detalles[filaConSerieIncompleta].cantidad} número(s) de serie`,
      );
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: VentaRequest = {
      tipoDocumentoId: valores.tipoDocumentoId!,
      numeroDocumento: valores.numeroDocumento,
      serieDocumentoId: valores.serieDocumentoId,
      clienteId: valores.clienteId!,
      almacenId: valores.almacenId!,
      monedaId: valores.monedaId!,
      fechaVencimiento: valores.fechaVencimiento || null,
      observaciones: valores.observaciones.trim() || null,
      detalles: valores.detalles.map((d) => ({
        productoId: d.productoId!,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuentoPct: d.descuentoPct ?? null,
        impuestoId: d.impuestoId,
        numerosSerie: d.requiereSerie ? d.numerosSerie : null,
      })),
    };

    this.ventaService.crear(payload).subscribe({
      next: () => this.router.navigateByUrl('/ventas'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo registrar la venta -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  private cargarCatalogos(): void {
    this.clienteService.listar(null, 0, 100).subscribe((r) => this.clientes.set(r.content));
    this.almacenService.listar().subscribe((r) => this.almacenes.set(r));
    this.monedaService.listar().subscribe((r) => this.monedas.set(r));
    this.tipoDocumentoService.listar('venta').subscribe((r) => this.tiposDocumento.set(r));
    this.impuestoService.listar().subscribe((r) => this.impuestos.set(r));
    this.categoriaService.listar().subscribe((r) => this.categorias.set(r));
    this.productoService.listar(null, 0, 200).subscribe((r) => this.productos.set(r.content));
  }

  private recargarSeriesDocumento(): void {
    const almacenId = this.formulario.controls.almacenId.value;
    const tipoDocumentoId = this.formulario.controls.tipoDocumentoId.value;
    // si cambia cualquiera de los dos, la serie ya elegida puede no corresponder más -- se limpia
    // (esto también dispara alCambiarSerieDocumento(null), que reactiva numeroDocumento)
    this.formulario.controls.serieDocumentoId.setValue(null);
    if (!almacenId || !tipoDocumentoId) {
      this.series.set([]);
      return;
    }
    this.serieDocumentoService.listar(almacenId, tipoDocumentoId).subscribe((series) => this.series.set(series));
  }

  private alCambiarSerieDocumento(serieDocumentoId: number | null): void {
    const control = this.formulario.controls.numeroDocumento;
    if (serieDocumentoId) {
      control.disable();
      control.setValue('');
      control.clearValidators();
    } else {
      control.enable();
      control.setValidators([Validators.required, Validators.maxLength(20)]);
    }
    control.updateValueAndValidity();
  }

  private aplicarRequiereSerie(index: number, detalle: ProductoDetalle): void {
    const categoria = detalle.categoriaId ? this.categorias().find((c) => c.id === detalle.categoriaId) : null;
    const requiere = categoria?.requiereSerie ?? false;
    this.detalles.at(index).patchValue({ requiereSerie: requiere });
    if (requiere) {
      this.refrescarSeriesDisponibles(index);
    } else {
      this.setSeriesDisponibles(index, []);
    }
  }

  private refrescarSeriesDisponibles(index: number): void {
    const fila = this.detalles.at(index);
    if (!fila.get('requiereSerie')!.value) {
      return;
    }
    const productoId = fila.get('productoId')!.value as number | null;
    const almacenId = this.formulario.controls.almacenId.value;
    if (!productoId || !almacenId) {
      this.setSeriesDisponibles(index, []);
      return;
    }
    this.serieProductoService.listarDisponibles(productoId, almacenId).subscribe((series) => {
      this.setSeriesDisponibles(index, series);
    });
  }

  private setSeriesDisponibles(index: number, series: SerieProductoResponse[]): void {
    this.seriesDisponiblesPorFila.update((filas) => filas.map((f, i) => (i === index ? series : f)));
  }

  private crearFilaDetalle(index: number) {
    const fila = this.fb.nonNullable.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descuentoPct: [0 as number | null],
      impuestoId: [null as number | null],
      requiereSerie: [false],
      numerosSerie: [[] as string[]],
    });
    // formControlName no dispara (ngModelChange) -- eso es de NgModel a secas. Para reaccionar a cambios
    // en un FormGroup reactivo hay que suscribirse a valueChanges del control en sí.
    fila.get('productoId')!.valueChanges.subscribe(() => this.alCambiarProducto(index));
    return fila;
  }
}
