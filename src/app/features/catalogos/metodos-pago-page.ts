import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { mensajeError } from '../../core/http/error-message';
import { MetodoPagoService } from './metodo-pago.service';
import { MetodoPagoRequest, MetodoPagoResponse } from './catalogos.models';

@Component({
  selector: 'app-metodos-pago-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
  ],
  templateUrl: './metodos-pago-page.html',
  styleUrl: './metodos-pago-page.scss',
})
export class MetodosPagoPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly metodoPagoService = inject(MetodoPagoService);

  protected readonly metodos = signal<MetodoPagoResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '' });
    this.modalVisible.set(true);
  }

  abrirEditar(metodo: MetodoPagoResponse): void {
    this.editandoId.set(metodo.id);
    this.error.set(null);
    this.formulario.reset({ nombre: metodo.nombre });
    this.modalVisible.set(true);
  }

  cancelar(): void {
    this.modalVisible.set(false);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: MetodoPagoRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.metodoPagoService.actualizar(id, payload) : this.metodoPagoService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el método de pago'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.metodoPagoService.listar().subscribe({
      next: (metodos) => {
        this.metodos.set(metodos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
