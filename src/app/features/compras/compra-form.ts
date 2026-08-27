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
import { ProveedorService } from '../proveedores/proveedor.service';
import { ProveedorResponse } from '../proveedores/proveedor.models';
import { ProductoService } from '../productos/producto.service';
import { ProductoDetalle, ProductoResumen } from '../productos/producto.models';
import { CompraService } from './compra.service';
import { CompraRequest } from './compra.models';

/** Subtotal/impuesto igual a la fórmula real de CompraService.crear() -- solo para mostrarle al usuario un total en vivo, la fuente de verdad sigue siendo lo que calcula el backend. */
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

@Component({
  selector: 'app-compra-form',
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
  templateUrl: './compra-form.html',
  styleUrl: './compra-form.scss',
})
export class CompraForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly compraService = inject(CompraService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly almacenService = inject(AlmacenService);
  private readonly monedaService = inject(MonedaService);
  private readonly tipoDocumentoService = inject(TipoDocumentoService);
  private readonly serieDocumentoService = inject(SerieDocumentoService);
  private readonly impuestoService = inject(ImpuestoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly proveedores = signal<ProveedorResponse[]>([]);
  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly monedas = signal<MonedaResponse[]>([]);
  protected readonly tiposDocumento = signal<TipoDocumentoResponse[]>([]);
  protected readonly impuestos = signal<ImpuestoResponse[]>([]);
  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly productos = signal<ProductoResumen[]>([]);
  /** Series disponibles para el almacén + tipo de documento elegidos en la cabecera -- vacío si falta alguno o no hay ninguna creada. */
  protected readonly series = signal<SerieDocumentoResponse[]>([]);

  private readonly cacheProductoDetalle = new Map<number, ProductoDetalle>();

  protected readonly formulario = this.fb.nonNullable.group({
    tipoDocumentoId: [null as number | null, Validators.required],
    numeroDocumento: ['', [Validators.required, Validators.maxLength(20)]],
    serieDocumentoId: [null as number | null],
    proveedorId: [null as number | null, Validators.required],
    almacenId: [null as number | null, Validators.required],
    monedaId: [null as number | null, Validators.required],
    fechaVencimiento: [''],
    observaciones: [''],
    detalles: this.fb.array([this.crearFilaDetalle(0)]),
  });

  ngOnInit(): void {
    this.cargarCatalogos();
    // formControlName no dispara (ngModelChange) -- eso es de NgModel a secas. Para reaccionar a cambios
    // en un FormGroup reactivo hay que suscribirse a valueChanges del control en sí.
    this.formulario.controls.almacenId.valueChanges.subscribe(() => this.recargarSeries());
    this.formulario.controls.tipoDocumentoId.valueChanges.subscribe(() => this.recargarSeries());
    this.formulario.controls.serieDocumentoId.valueChanges.subscribe((id) => this.alCambiarSerie(id));
  }

  get detalles(): FormArray {
    return this.formulario.controls.detalles;
  }

  seriesDe(index: number): FormArray {
    return this.detalles.at(index).get('numerosSerie') as FormArray;
  }

  agregarFila(): void {
    this.detalles.push(this.crearFilaDetalle(this.detalles.length));
  }

  quitarFila(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  alCambiarProducto(index: number): void {
    const fila = this.detalles.at(index);
    const productoId = fila.get('productoId')!.value as number | null;
    if (!productoId) {
      fila.patchValue({ requiereSerie: false });
      this.redimensionarSeries(index, 0);
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

  alCambiarCantidad(index: number): void {
    const fila = this.detalles.at(index);
    if (fila.get('requiereSerie')!.value) {
      this.redimensionarSeries(index, fila.get('cantidad')!.value as number);
    }
  }

  /** Igual a la fórmula real de CompraService.crear() -- solo para feedback visual, el backend recalcula todo igual. */
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

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();
    const payload: CompraRequest = {
      tipoDocumentoId: valores.tipoDocumentoId!,
      numeroDocumento: valores.numeroDocumento,
      serieDocumentoId: valores.serieDocumentoId,
      proveedorId: valores.proveedorId!,
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
        // FormArray<string> tipa cada control como `string | null` aunque se construyan como nonNullable
        // -- son valores reales (el form los valida como required), el cast es seguro.
        numerosSerie: d.requiereSerie ? (d.numerosSerie as string[]) : null,
      })),
    };

    this.compraService.crear(payload).subscribe({
      next: () => this.router.navigateByUrl('/compras'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo registrar la compra -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  private cargarCatalogos(): void {
    this.proveedorService.listar(null, 0, 100).subscribe((r) => this.proveedores.set(r.content));
    this.almacenService.listar().subscribe((r) => this.almacenes.set(r));
    this.monedaService.listar().subscribe((r) => this.monedas.set(r));
    this.tipoDocumentoService.listar('compra').subscribe((r) => this.tiposDocumento.set(r));
    this.impuestoService.listar().subscribe((r) => this.impuestos.set(r));
    this.categoriaService.listar().subscribe((r) => this.categorias.set(r));
    this.productoService.listar(null, 0, 200).subscribe((r) => this.productos.set(r.content));
  }

  private recargarSeries(): void {
    const almacenId = this.formulario.controls.almacenId.value;
    const tipoDocumentoId = this.formulario.controls.tipoDocumentoId.value;
    // si cambia cualquiera de los dos, la serie ya elegida puede no corresponder más -- se limpia
    // (esto también dispara alCambiarSerie(null), que reactiva numeroDocumento)
    this.formulario.controls.serieDocumentoId.setValue(null);
    if (!almacenId || !tipoDocumentoId) {
      this.series.set([]);
      return;
    }
    this.serieDocumentoService.listar(almacenId, tipoDocumentoId).subscribe((series) => this.series.set(series));
  }

  private alCambiarSerie(serieDocumentoId: number | null): void {
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
    const fila = this.detalles.at(index);
    fila.patchValue({ requiereSerie: requiere });
    this.redimensionarSeries(index, requiere ? (fila.get('cantidad')!.value as number) : 0);
  }

  private redimensionarSeries(index: number, tamano: number): void {
    const arreglo = this.seriesDe(index);
    while (arreglo.length < tamano) {
      arreglo.push(this.fb.nonNullable.control('', Validators.required));
    }
    while (arreglo.length > tamano) {
      arreglo.removeAt(arreglo.length - 1);
    }
  }

  private crearFilaDetalle(index: number) {
    const fila = this.fb.nonNullable.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descuentoPct: [0 as number | null],
      impuestoId: [null as number | null],
      requiereSerie: [false],
      numerosSerie: this.fb.array<string>([]),
    });
    // formControlName no dispara (ngModelChange) -- eso es de NgModel a secas. Para reaccionar a cambios
    // en un FormGroup reactivo hay que suscribirse a valueChanges del control en sí.
    fila.get('productoId')!.valueChanges.subscribe(() => this.alCambiarProducto(index));
    fila.get('cantidad')!.valueChanges.subscribe(() => this.alCambiarCantidad(index));
    return fila;
  }
}
