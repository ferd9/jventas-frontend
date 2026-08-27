import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { mensajeError } from '../../core/http/error-message';
import { MarcaService } from './marca.service';
import { ModeloService } from './modelo.service';
import { MarcaResponse, ModeloRequest, ModeloResponse } from './catalogos.models';

@Component({
  selector: 'app-modelos-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './modelos-page.html',
  styleUrl: './modelos-page.scss',
})
export class ModelosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly marcaService = inject(MarcaService);
  private readonly modeloService = inject(ModeloService);

  protected readonly modelos = signal<ModeloResponse[]>([]);
  protected readonly marcas = signal<MarcaResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    marcaId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.marcaService.listar().subscribe((marcas) => this.marcas.set(marcas));
    this.cargar();
  }

  protected nombreMarca(marcaId: number): string {
    return this.marcas().find((m) => m.id === marcaId)?.nombre ?? '—';
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', marcaId: null });
    this.modalVisible.set(true);
  }

  abrirEditar(modelo: ModeloResponse): void {
    this.editandoId.set(modelo.id);
    this.error.set(null);
    this.formulario.reset({ nombre: modelo.nombre, marcaId: modelo.marcaId });
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
    const payload: ModeloRequest = { nombre: valores.nombre, marcaId: valores.marcaId! };
    const id = this.editandoId();
    const peticion = id ? this.modeloService.actualizar(id, payload) : this.modeloService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el modelo'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.modeloService.listar().subscribe({
      next: (modelos) => {
        this.modelos.set(modelos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
