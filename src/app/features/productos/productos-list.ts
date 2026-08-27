import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { mensajeError } from '../../core/http/error-message';
import { ProductoService } from './producto.service';
import { ProductoResumen } from './producto.models';

@Component({
  selector: 'app-productos-list',
  imports: [FormsModule, RouterLink, NzButtonModule, NzIconModule, NzInputModule, NzPopconfirmModule, NzTableModule, NzTagModule],
  templateUrl: './productos-list.html',
  styleUrl: './productos-list.scss',
})
export class ProductosList implements OnInit {
  protected readonly productos = signal<ProductoResumen[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly busqueda = signal('');
  protected readonly errorAccion = signal<string | null>(null);

  private pagina = 0;
  private tamano = 20;

  constructor(private readonly productoService: ProductoService) {}

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

  // "eliminar" en el backend es en realidad un soft-delete (pone activo=false) y no
  // tiene endpoint de reactivar -- por eso acá se llama "Desactivar" y no hay vuelta atrás
  desactivar(producto: ProductoResumen): void {
    this.errorAccion.set(null);
    this.productoService.eliminar(producto.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.errorAccion.set(mensajeError(err, 'No se pudo desactivar el producto')),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.productoService.listar(this.busqueda() || null, this.pagina, this.tamano).subscribe({
      next: (respuesta) => {
        this.productos.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
