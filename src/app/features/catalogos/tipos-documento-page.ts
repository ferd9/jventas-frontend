import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { TipoDocumentoService } from './tipo-documento.service';
import { TipoDocumentoRequest, TipoDocumentoResponse } from './catalogos.models';

@Component({
  selector: 'app-tipos-documento-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './tipos-documento-page.html',
  styleUrl: './tipos-documento-page.scss',
})
export class TiposDocumentoPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tipoDocumentoService = inject(TipoDocumentoService);

  protected readonly tipos = signal<TipoDocumentoResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    aplicaCompra: [false],
    aplicaVenta: [false],
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', aplicaCompra: false, aplicaVenta: false });
    this.modalVisible.set(true);
  }

  abrirEditar(tipo: TipoDocumentoResponse): void {
    this.editandoId.set(tipo.id);
    this.error.set(null);
    this.formulario.reset({ nombre: tipo.nombre, aplicaCompra: tipo.aplicaCompra, aplicaVenta: tipo.aplicaVenta });
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

    const payload: TipoDocumentoRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.tipoDocumentoService.actualizar(id, payload) : this.tipoDocumentoService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el tipo de documento'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.tipoDocumentoService.listar().subscribe({
      next: (tipos) => {
        this.tipos.set(tipos);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
