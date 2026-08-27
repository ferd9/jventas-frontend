import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { ImpuestoService } from './impuesto.service';
import { ImpuestoRequest, ImpuestoResponse } from './catalogos.models';

@Component({
  selector: 'app-impuestos-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './impuestos-page.html',
  styleUrl: './impuestos-page.scss',
})
export class ImpuestosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly impuestoService = inject(ImpuestoService);

  protected readonly impuestos = signal<ImpuestoResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tasa: [0, [Validators.required, Validators.min(0)]],
    esDefault: [false],
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', tasa: 0, esDefault: false });
    this.modalVisible.set(true);
  }

  abrirEditar(impuesto: ImpuestoResponse): void {
    this.editandoId.set(impuesto.id);
    this.error.set(null);
    this.formulario.reset({ nombre: impuesto.nombre, tasa: impuesto.tasa, esDefault: impuesto.esDefault });
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

    const payload: ImpuestoRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.impuestoService.actualizar(id, payload) : this.impuestoService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el impuesto'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.impuestoService.listar().subscribe({
      next: (impuestos) => {
        this.impuestos.set(impuestos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
