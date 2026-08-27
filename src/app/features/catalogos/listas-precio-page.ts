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
import { ListaPrecioService } from './lista-precio.service';
import { ListaPrecioRequest, ListaPrecioResponse } from './catalogos.models';

@Component({
  selector: 'app-listas-precio-page',
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
  templateUrl: './listas-precio-page.html',
  styleUrl: './listas-precio-page.scss',
})
export class ListasPrecioPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly listaPrecioService = inject(ListaPrecioService);

  protected readonly listas = signal<ListaPrecioResponse[]>([]);
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

  abrirEditar(lista: ListaPrecioResponse): void {
    this.editandoId.set(lista.id);
    this.error.set(null);
    this.formulario.reset({ nombre: lista.nombre });
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

    const payload: ListaPrecioRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.listaPrecioService.actualizar(id, payload) : this.listaPrecioService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la lista de precio'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.listaPrecioService.listar().subscribe({
      next: (listas) => {
        this.listas.set(listas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
