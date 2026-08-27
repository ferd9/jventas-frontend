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
import { AlmacenResponse } from '../catalogos/catalogos.models';
import { ProductoService } from '../productos/producto.service';
import { ProductoResumen } from '../productos/producto.models';
import { TrasladoService } from './traslado.service';
import { TrasladoRequest } from './traslado.models';

@Component({
  selector: 'app-traslado-form',
  imports: [
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
  templateUrl: './traslado-form.html',
  styleUrl: './traslado-form.scss',
})
export class TrasladoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly trasladoService = inject(TrasladoService);
  private readonly almacenService = inject(AlmacenService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly productos = signal<ProductoResumen[]>([]);

  protected readonly formulario = this.fb.nonNullable.group({
    almacenOrigenId: [null as number | null, Validators.required],
    almacenDestinoId: [null as number | null, Validators.required],
    observaciones: [''],
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

    const valores = this.formulario.getRawValue();
    if (valores.almacenOrigenId === valores.almacenDestinoId) {
      this.error.set('El almacén de origen y destino no pueden ser el mismo');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: TrasladoRequest = {
      almacenOrigenId: valores.almacenOrigenId!,
      almacenDestinoId: valores.almacenDestinoId!,
      observaciones: valores.observaciones.trim() || null,
      detalles: valores.detalles.map((d) => ({ productoId: d.productoId!, cantidad: d.cantidad })),
    };

    this.trasladoService.crear(payload).subscribe({
      next: () => this.router.navigateByUrl('/traslados'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo registrar el traslado -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  private crearFilaDetalle() {
    return this.fb.nonNullable.group({
      productoId: [null as number | null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }
}
