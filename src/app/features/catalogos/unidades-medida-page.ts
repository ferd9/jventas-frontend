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
import { UnidadMedidaService } from './unidad-medida.service';
import { UnidadMedidaRequest, UnidadMedidaResponse } from './catalogos.models';

@Component({
  selector: 'app-unidades-medida-page',
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
  templateUrl: './unidades-medida-page.html',
  styleUrl: './unidades-medida-page.scss',
})
export class UnidadesMedidaPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly unidadMedidaService = inject(UnidadMedidaService);

  protected readonly unidades = signal<UnidadMedidaResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    abreviatura: ['', Validators.maxLength(10)],
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', abreviatura: '' });
    this.modalVisible.set(true);
  }

  abrirEditar(unidad: UnidadMedidaResponse): void {
    this.editandoId.set(unidad.id);
    this.error.set(null);
    this.formulario.reset({ nombre: unidad.nombre, abreviatura: unidad.abreviatura ?? '' });
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

    const valores = this.formulario.getRawValue();
    const payload: UnidadMedidaRequest = { nombre: valores.nombre, abreviatura: valores.abreviatura.trim() || null };
    const id = this.editandoId();
    const peticion = id ? this.unidadMedidaService.actualizar(id, payload) : this.unidadMedidaService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la unidad de medida'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.unidadMedidaService.listar().subscribe({
      next: (unidades) => {
        this.unidades.set(unidades);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
