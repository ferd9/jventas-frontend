import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { UsuarioService } from '../usuarios/usuario.service';
import { UsuarioResponse } from '../usuarios/usuario.models';
import { AlmacenService } from './almacen.service';
import { EncargadoAlmacenService } from './encargado-almacen.service';
import { AlmacenRequest, AlmacenResponse, EncargadoAlmacenResponse, TIPOS_CARGO_ALMACEN, TipoCargoAlmacen } from './catalogos.models';

/**
 * Sin al menos un almacén no se puede registrar ninguna compra ni venta
 * (ambas exigen almacenId) -- catálogo mínimo pero bloqueante, no lo trae
 * ningún seed de Flyway a propósito (la dirección de cada local es del
 * negocio, no algo que se pueda inventar).
 */
@Component({
  selector: 'app-almacenes-page',
  imports: [
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './almacenes-page.html',
  styleUrl: './almacenes-page.scss',
})
export class AlmacenesPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly almacenService = inject(AlmacenService);
  private readonly encargadoAlmacenService = inject(EncargadoAlmacenService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly tiposCargo = TIPOS_CARGO_ALMACEN;

  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly errorAccion = signal<string | null>(null);

  protected readonly modalVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccionLinea: ['', Validators.required],
    pais: [''],
    departamento: [''],
    distrito: [''],
  });

  // modal de encargados -- un almacén a la vez
  protected readonly encargadosModalVisible = signal(false);
  protected readonly almacenSeleccionado = signal<AlmacenResponse | null>(null);
  protected readonly encargados = signal<EncargadoAlmacenResponse[]>([]);
  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly cargandoEncargados = signal(false);
  protected readonly guardandoEncargado = signal(false);
  protected readonly errorEncargado = signal<string | null>(null);

  protected readonly formularioEncargado = this.fb.nonNullable.group({
    usuarioId: [null as number | null, Validators.required],
    tipoCargo: ['EMPLEADO' as TipoCargoAlmacen, Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  abrirCrear(): void {
    this.editandoId.set(null);
    this.error.set(null);
    this.formulario.reset({ nombre: '', direccionLinea: '', pais: '', departamento: '', distrito: '' });
    this.modalVisible.set(true);
  }

  abrirEditar(almacen: AlmacenResponse): void {
    this.editandoId.set(almacen.id);
    this.error.set(null);
    this.formulario.reset({
      nombre: almacen.nombre,
      direccionLinea: almacen.direccion.direccionLinea,
      pais: almacen.direccion.pais ?? '',
      departamento: almacen.direccion.departamento ?? '',
      distrito: almacen.direccion.distrito ?? '',
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

    const valores = this.formulario.getRawValue();
    const payload: AlmacenRequest = {
      nombre: valores.nombre,
      direccion: {
        direccionLinea: valores.direccionLinea,
        pais: valores.pais.trim() || null,
        departamento: valores.departamento.trim() || null,
        distrito: valores.distrito.trim() || null,
      },
    };

    const id = this.editandoId();
    const peticion = id ? this.almacenService.actualizar(id, payload) : this.almacenService.crear(payload);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el almacén'));
        this.guardando.set(false);
      },
    });
  }

  // "eliminar" en el backend es en realidad un soft-delete (pone activo=false) y no
  // tiene endpoint de reactivar -- por eso acá se llama "Desactivar" y no hay vuelta atrás
  desactivar(almacen: AlmacenResponse): void {
    this.errorAccion.set(null);
    this.almacenService.eliminar(almacen.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo desactivar el almacén')),
    });
  }

  abrirEncargados(almacen: AlmacenResponse): void {
    this.almacenSeleccionado.set(almacen);
    this.errorEncargado.set(null);
    this.formularioEncargado.reset({ usuarioId: null, tipoCargo: 'EMPLEADO' });
    this.encargadosModalVisible.set(true);
    this.cargarEncargados(almacen.id);

    // se pide solo la primera vez -- la lista de usuarios no cambia entre almacenes
    if (this.usuarios().length === 0) {
      this.usuarioService.listar(0, 200).subscribe((r) => this.usuarios.set(r.content));
    }
  }

  cerrarEncargados(): void {
    this.encargadosModalVisible.set(false);
    this.almacenSeleccionado.set(null);
  }

  asignarEncargado(): void {
    if (this.formularioEncargado.invalid) {
      this.formularioEncargado.markAllAsTouched();
      return;
    }
    const almacen = this.almacenSeleccionado();
    if (!almacen) {
      return;
    }

    this.guardandoEncargado.set(true);
    this.errorEncargado.set(null);

    const valores = this.formularioEncargado.getRawValue();
    this.encargadoAlmacenService
      .asignar({ usuarioId: valores.usuarioId!, almacenId: almacen.id, tipoCargo: valores.tipoCargo })
      .subscribe({
        next: () => {
          this.guardandoEncargado.set(false);
          this.formularioEncargado.reset({ usuarioId: null, tipoCargo: 'EMPLEADO' });
          this.cargarEncargados(almacen.id);
        },
        error: (err) => {
          this.errorEncargado.set(mensajeError(err, 'No se pudo asignar el encargado'));
          this.guardandoEncargado.set(false);
        },
      });
  }

  quitarEncargado(encargado: EncargadoAlmacenResponse): void {
    const almacen = this.almacenSeleccionado();
    if (!almacen) {
      return;
    }
    this.errorEncargado.set(null);
    this.encargadoAlmacenService.quitar(encargado.id).subscribe({
      next: () => this.cargarEncargados(almacen.id),
      error: (err) => this.errorEncargado.set(mensajeError(err, 'No se pudo quitar el encargado')),
    });
  }

  private cargarEncargados(almacenId: number): void {
    this.cargandoEncargados.set(true);
    this.encargadoAlmacenService.porAlmacen(almacenId).subscribe({
      next: (r) => {
        this.encargados.set(r);
        this.cargandoEncargados.set(false);
      },
      error: () => this.cargandoEncargados.set(false),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.almacenService.listar().subscribe({
      next: (almacenes) => {
        this.almacenes.set(almacenes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
