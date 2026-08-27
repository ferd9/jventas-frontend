import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PermisoService } from './permiso.service';
import { RolService } from './rol.service';
import { PermisoResponse, RolRequest, RolResponse } from './rol.models';

interface GrupoPermisos {
  modulo: string;
  permisos: PermisoResponse[];
}

/** Módulo antes de los dos puntos en el código -- "producto:ver" -> "producto" -- solo para agrupar los checkboxes, no existe como concepto en el backend. */
function agrupar(permisos: PermisoResponse[]): GrupoPermisos[] {
  const porModulo = new Map<string, PermisoResponse[]>();
  for (const permiso of permisos) {
    const modulo = permiso.codigo.split(':')[0];
    const lista = porModulo.get(modulo) ?? [];
    lista.push(permiso);
    porModulo.set(modulo, lista);
  }
  return Array.from(porModulo.entries())
    .map(([modulo, lista]) => ({ modulo, permisos: lista }))
    .sort((a, b) => a.modulo.localeCompare(b.modulo));
}

@Component({
  selector: 'app-roles-page',
  imports: [
    FormsModule,
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
  templateUrl: './roles-page.html',
  styleUrl: './roles-page.scss',
})
export class RolesPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rolService = inject(RolService);
  private readonly permisoService = inject(PermisoService);

  protected readonly roles = signal<RolResponse[]>([]);
  protected readonly gruposPermisos = signal<GrupoPermisos[]>([]);
  protected readonly cargando = signal(false);
  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly permisosSeleccionados = signal<Set<number>>(new Set());

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.permisoService.listar().subscribe((permisos) => this.gruposPermisos.set(agrupar(permisos)));
    this.cargar();
  }

  estaSeleccionado(permisoId: number): boolean {
    return this.permisosSeleccionados().has(permisoId);
  }

  togglePermiso(permisoId: number): void {
    this.permisosSeleccionados.update((actuales) => {
      const nuevo = new Set(actuales);
      if (nuevo.has(permisoId)) {
        nuevo.delete(permisoId);
      } else {
        nuevo.add(permisoId);
      }
      return nuevo;
    });
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', descripcion: '' });
    this.permisosSeleccionados.set(new Set());
    this.modalVisible.set(true);
  }

  abrirEditar(rol: RolResponse): void {
    this.editandoId.set(rol.id);
    this.error.set(null);
    this.formulario.reset({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });
    this.permisosSeleccionados.set(new Set(rol.permisos.map((p) => p.id)));
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
    const payload: RolRequest = {
      nombre: valores.nombre,
      descripcion: valores.descripcion.trim() || null,
      permisoIds: Array.from(this.permisosSeleccionados()),
    };
    const id = this.editandoId();
    const peticion = id ? this.rolService.actualizar(id, payload) : this.rolService.crear(payload);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el rol'));
        this.guardando.set(false);
      },
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.rolService.listar().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
