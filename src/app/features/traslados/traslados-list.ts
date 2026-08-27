import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeError } from '../../core/http/error-message';
import { ESTADO_TRASLADO_COLOR, ESTADO_TRASLADO_LABEL } from '../../core/models/estado-traslado';
import { TrasladoService } from './traslado.service';
import { TrasladoDetalleResponse, TrasladoResumenResponse } from './traslado.models';

@Component({
  selector: 'app-traslados-list',
  imports: [RouterLink, NzButtonModule, NzDrawerModule, NzIconModule, NzPopconfirmModule, NzTableModule, NzTagModule],
  templateUrl: './traslados-list.html',
  styleUrl: './traslados-list.scss',
})
export class TrasladosList implements OnInit {
  private readonly trasladoService = inject(TrasladoService);
  protected readonly authService = inject(AuthService);

  protected readonly estadoLabel = ESTADO_TRASLADO_LABEL;
  protected readonly estadoColor = ESTADO_TRASLADO_COLOR;

  protected readonly traslados = signal<TrasladoResumenResponse[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);

  protected readonly drawerVisible = signal(false);
  protected readonly drawerCargando = signal(false);
  protected readonly trasladoSeleccionado = signal<TrasladoDetalleResponse | null>(null);
  protected readonly errorAccion = signal<string | null>(null);

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

  verDetalle(traslado: TrasladoResumenResponse): void {
    this.drawerVisible.set(true);
    this.drawerCargando.set(true);
    this.errorAccion.set(null);
    this.trasladoService.obtener(traslado.id).subscribe({
      next: (detalle) => {
        this.trasladoSeleccionado.set(detalle);
        this.drawerCargando.set(false);
      },
      error: () => this.drawerCargando.set(false),
    });
  }

  cerrarDrawer(): void {
    this.drawerVisible.set(false);
    this.trasladoSeleccionado.set(null);
  }

  completar(traslado: TrasladoDetalleResponse): void {
    this.errorAccion.set(null);
    this.trasladoService.completar(traslado.id).subscribe({
      next: (actualizado) => {
        this.trasladoSeleccionado.set(actualizado);
        this.cargar();
      },
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo completar el traslado')),
    });
  }

  anular(traslado: TrasladoDetalleResponse): void {
    this.errorAccion.set(null);
    this.trasladoService.anular(traslado.id).subscribe({
      next: (actualizado) => {
        this.trasladoSeleccionado.set(actualizado);
        this.cargar();
      },
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo anular el traslado')),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.trasladoService.listar(this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.traslados.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
