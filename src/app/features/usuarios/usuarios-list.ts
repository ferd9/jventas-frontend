import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { AuditoriaSesionService } from './auditoria-sesion.service';
import { AuditoriaSesionResponse } from './auditoria-sesion.models';
import { UsuarioService } from './usuario.service';
import { UsuarioResponse } from './usuario.models';

@Component({
  selector: 'app-usuarios-list',
  imports: [DatePipe, RouterLink, NzButtonModule, NzIconModule, NzModalModule, NzPopconfirmModule, NzTableModule, NzTagModule],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.scss',
})
export class UsuariosList implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auditoriaSesionService = inject(AuditoriaSesionService);

  protected readonly usuarios = signal<UsuarioResponse[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);

  protected readonly passwordModalVisible = signal(false);
  protected readonly passwordGenerada = signal<string | null>(null);
  protected readonly errorAccion = signal<string | null>(null);

  protected readonly sesionesModalVisible = signal(false);
  protected readonly sesionesUsuarioNombre = signal('');
  protected readonly sesiones = signal<AuditoriaSesionResponse[]>([]);
  protected readonly cargandoSesiones = signal(false);

  private pagina = 0;
  private tamano = 20;

  ngOnInit(): void {
    this.cargar();
  }

  cambiarPagina(evento: NzTableQueryParams): void {
    this.pagina = evento.pageIndex - 1;
    this.tamano = evento.pageSize;
    this.cargar();
  }

  desactivar(usuario: UsuarioResponse): void {
    this.errorAccion.set(null);
    this.usuarioService.desactivar(usuario.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo desactivar el usuario')),
    });
  }

  reactivar(usuario: UsuarioResponse): void {
    this.errorAccion.set(null);
    this.usuarioService.reactivar(usuario.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo reactivar el usuario')),
    });
  }

  resetearPassword(usuario: UsuarioResponse): void {
    this.errorAccion.set(null);
    this.usuarioService.resetearPassword(usuario.id).subscribe({
      next: (respuesta) => {
        this.passwordGenerada.set(respuesta.passwordNueva);
        this.passwordModalVisible.set(true);
      },
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo resetear la contraseña')),
    });
  }

  cerrarPasswordModal(): void {
    this.passwordModalVisible.set(false);
    this.passwordGenerada.set(null);
  }

  verSesiones(usuario: UsuarioResponse): void {
    this.errorAccion.set(null);
    this.sesionesUsuarioNombre.set(`${usuario.nombre} ${usuario.apellidos}`);
    this.sesionesModalVisible.set(true);
    this.cargandoSesiones.set(true);
    this.auditoriaSesionService.listar(usuario.id).subscribe({
      next: (sesiones) => {
        this.sesiones.set(sesiones);
        this.cargandoSesiones.set(false);
      },
      error: () => this.cargandoSesiones.set(false),
    });
  }

  cerrarSesionesModal(): void {
    this.sesionesModalVisible.set(false);
    this.sesiones.set([]);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.usuarioService.listar(this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.usuarios.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
