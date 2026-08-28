import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ArchivoService } from '../../core/archivos/archivo.service';
import { CatalogoPublicoService } from './catalogo-publico.service';
import { ProductoPublico } from './catalogo-publico.models';

@Component({
  selector: 'app-catalogo-publico-page',
  imports: [
    DecimalPipe,
    FormsModule,
    NzCardModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzPaginationModule,
    NzSpinModule,
    NzTagModule,
  ],
  templateUrl: './catalogo-publico-page.html',
  styleUrl: './catalogo-publico-page.scss',
})
export class CatalogoPublicoPage implements OnInit {
  protected readonly productos = signal<ProductoPublico[]>([]);
  protected readonly total = signal(0);
  protected readonly cargando = signal(false);
  protected readonly busqueda = signal('');
  protected readonly pagina = signal(1);

  protected readonly tamano = 12;

  constructor(
    private readonly catalogoService: CatalogoPublicoService,
    private readonly archivoService: ArchivoService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  buscar(termino: string): void {
    this.busqueda.set(termino);
    this.pagina.set(1);
    this.cargar();
  }

  cambiarPagina(nuevaPagina: number): void {
    this.pagina.set(nuevaPagina);
    this.cargar();
  }

  urlImagen(url: string): string {
    return this.archivoService.resolverUrl(url);
  }

  private cargar(): void {
    this.cargando.set(true);
    this.catalogoService.listar(this.busqueda() || null, this.pagina() - 1, this.tamano).subscribe({
      next: (respuesta) => {
        this.productos.set(respuesta.content);
        this.total.set(respuesta.totalElements);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
