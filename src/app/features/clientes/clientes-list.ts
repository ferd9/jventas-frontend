import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ClienteService } from './cliente.service';
import { ClienteResponse } from './cliente.models';

@Component({
  selector: 'app-clientes-list',
  imports: [
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.scss',
})
export class ClientesList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<ClienteResponse[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly busqueda = signal('');

  private pagina = 0;
  private tamano = 20;

  ngOnInit(): void {
    this.cargar();
  }

  buscar(termino: string): void {
    this.busqueda.set(termino);
    this.pagina = 0;
    this.cargar();
  }

  cambiarPagina(evento: NzTableQueryParams): void {
    this.pagina = evento.pageIndex - 1;
    this.tamano = evento.pageSize;
    this.cargar();
  }

  desactivar(cliente: ClienteResponse): void {
    this.clienteService.desactivar(cliente.id).subscribe(() => this.cargar());
  }

  reactivar(cliente: ClienteResponse): void {
    this.clienteService.reactivar(cliente.id).subscribe(() => this.cargar());
  }

  private cargar(): void {
    this.cargando.set(true);
    this.clienteService.listar(this.busqueda() || null, this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.clientes.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
