import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { CategoriaService } from './categoria.service';
import { CategoriaRequest, CategoriaResponse } from './catalogos.models';

/**
 * Catálogo chico (decenas de filas, no cientos) -- se lista completo sin
 * paginación y se crea/edita en un modal, a diferencia de Clientes/Proveedores
 * que sí necesitan su propia ruta con búsqueda paginada.
 */
@Component({
  selector: 'app-categorias-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './categorias-page.html',
  styleUrl: './categorias-page.scss',
})
export class CategoriasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly categorias = signal<CategoriaResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    categoriaPadreId: [null as number | null],
    requiereSerie: [false],
  });

  ngOnInit(): void {
    this.cargar();
  }

  nombrePadre(id: number | null): string {
    if (!id) {
      return '—';
    }
    return this.categorias().find((c) => c.id === id)?.nombre ?? '—';
  }

  /** Opciones de categoría padre: todo el catálogo menos la fila que se está editando (no puede ser padre de sí misma). */
  opcionesPadre(): CategoriaResponse[] {
    const id = this.editandoId();
    return this.categorias().filter((c) => c.id !== id);
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', categoriaPadreId: null, requiereSerie: false });
    this.modalVisible.set(true);
  }

  abrirEditar(categoria: CategoriaResponse): void {
    this.editandoId.set(categoria.id);
    this.error.set(null);
    this.formulario.reset({
      nombre: categoria.nombre,
      categoriaPadreId: categoria.categoriaPadreId,
      requiereSerie: categoria.requiereSerie,
    });
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

    const payload: CategoriaRequest = this.formulario.getRawValue();
    const id = this.editandoId();
    const peticion = id ? this.categoriaService.actualizar(id, payload) : this.categoriaService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar la categoría'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
