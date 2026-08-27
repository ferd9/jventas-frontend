import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { CargoService } from './cargo.service';
import { CargoRequest, CargoResponse } from './catalogos.models';

@Component({
  selector: 'app-cargos-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './cargos-page.html',
  styleUrl: './cargos-page.scss',
})
export class CargosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cargoService = inject(CargoService);

  protected readonly cargos = signal<CargoResponse[]>([]);
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

  abrirEditar(cargo: CargoResponse): void {
    this.editandoId.set(cargo.id);
    this.error.set(null);
    this.formulario.reset({ nombre: cargo.nombre });
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

    const payload: CargoRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.cargoService.actualizar(id, payload) : this.cargoService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el cargo'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.cargoService.listar().subscribe({
      next: (cargos) => {
        this.cargos.set(cargos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
