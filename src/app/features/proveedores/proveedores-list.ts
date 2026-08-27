import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProveedorService } from './proveedor.service';
import { ProveedorResponse } from './proveedor.models';

@Component({
  selector: 'app-proveedores-list',
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
  templateUrl: './proveedores-list.html',
  styleUrl: './proveedores-list.scss',
})
export class ProveedoresList implements OnInit {
  private readonly proveedorService = inject(ProveedorService);

  protected readonly proveedores = signal<ProveedorResponse[]>([]);
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

  desactivar(proveedor: ProveedorResponse): void {
    this.proveedorService.desactivar(proveedor.id).subscribe(() => this.cargar());
  }

  reactivar(proveedor: ProveedorResponse): void {
    this.proveedorService.reactivar(proveedor.id).subscribe(() => this.cargar());
  }

  private cargar(): void {
    this.cargando.set(true);
    this.proveedorService.listar(this.busqueda() || null, this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.proveedores.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
