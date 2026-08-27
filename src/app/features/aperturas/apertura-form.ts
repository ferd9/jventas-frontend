import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { mensajeError } from '../../core/http/error-message';
import { AlmacenService } from '../catalogos/almacen.service';
import { AlmacenResponse } from '../catalogos/catalogos.models';
import { AlmacenStockResponse } from '../kardex/kardex.models';
import { ProductoService } from '../productos/producto.service';
import { ProductoResumen } from '../productos/producto.models';
import { AperturaService } from './apertura.service';
import { AperturaRequest } from './apertura.models';

/**
 * Registra el stock inicial de un almacén (o de un producto nuevo en un
 * almacén ya operando) -- no es una entidad con historial propio, es una
 * acción de una sola vez por combinación almacén+producto: el backend
 * rechaza la línea si ya existe stock registrado ahí (para ajustar stock
 * existente hay que usar compra, venta o traslado, no esto).
 */
@Component({
  selector: 'app-apertura-form',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './apertura-form.html',
  styleUrl: './apertura-form.scss',
})
export class AperturaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly almacenService = inject(AlmacenService);
  private readonly productoService = inject(ProductoService);
  private readonly aperturaService = inject(AperturaService);

  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly productos = signal<ProductoResumen[]>([]);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resultado = signal<AlmacenStockResponse[] | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    almacenId: [null as number | null, Validators.required],
    detalles: this.fb.array([this.crearFilaDetalle()]),
  });

  ngOnInit(): void {
    this.almacenService.listar().subscribe((r) => this.almacenes.set(r));
    this.productoService.listar(null, 0, 200).subscribe((r) => this.productos.set(r.content));
  }

  get detalles(): FormArray {
    return this.formulario.controls.detalles;
  }

  agregarFila(): void {
    this.detalles.push(this.crearFilaDetalle());
  }

  quitarFila(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    }
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();
    const payload: AperturaRequest = {
      almacenId: valores.almacenId!,
      detalles: valores.detalles.map((d) => ({ productoId: d.productoId!, cantidad: d.cantidad })),
    };

    this.aperturaService.registrar(payload).subscribe({
      next: (stock) => {
        this.guardando.set(false);
        this.resultado.set(stock);
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo registrar la apertura -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  nuevaApertura(): void {
    this.resultado.set(null);
    this.error.set(null);
    this.formulario.reset({ almacenId: null });
    this.detalles.clear();
    this.detalles.push(this.crearFilaDetalle());
  }

  private crearFilaDetalle() {
    return this.fb.nonNullable.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }
}
