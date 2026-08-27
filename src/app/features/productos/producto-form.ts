import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { forkJoin } from 'rxjs';
import { ArchivoService } from '../../core/archivos/archivo.service';
import { CatalogoService, OpcionCatalogo } from '../../core/catalogos/catalogo.service';
import { mensajeError } from '../../core/http/error-message';
import { ProductoService } from './producto.service';
import {
  ImpuestoOpcion,
  ModeloOpcion,
  PrecioRequest,
  ProductoRequest,
  TIPOS_PRODUCTO,
  TipoProducto,
  UnidadMedidaOpcion,
} from './producto.models';

@Component({
  selector: 'app-producto-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzIconModule,
    NzAlertModule,
  ],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.scss',
})
export class ProductoForm implements OnInit {
  // inject() en vez de constructor-injection a propósito: los inicializadores de
  // campo corren antes de que las parameter properties del constructor se asignen,
  // así que `this.fb` en un inicializador revienta con "used before initialization"
  private readonly fb = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoService);
  private readonly archivoService = inject(ArchivoService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly tiposProducto = TIPOS_PRODUCTO;
  protected readonly monedas = signal<OpcionCatalogo[]>([]);
  protected readonly categorias = signal<OpcionCatalogo[]>([]);
  protected readonly marcas = signal<OpcionCatalogo[]>([]);
  protected readonly modelos = signal<ModeloOpcion[]>([]);
  protected readonly unidadesMedida = signal<UnidadMedidaOpcion[]>([]);
  protected readonly impuestos = signal<ImpuestoOpcion[]>([]);
  protected readonly listasPrecio = signal<OpcionCatalogo[]>([]);

  protected readonly productoId = signal<number | null>(null);
  protected readonly imagenUrl = signal<string | null>(null);
  protected readonly subiendoImagen = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    codigoBarras: ['', Validators.required],
    codigo: ['', Validators.required],
    codigoFabricante: ['', Validators.maxLength(30)],
    nombre: ['', Validators.required],
    costo: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]],
    tipo: ['INSUMO' as TipoProducto, Validators.required],
    monedaId: [null as number | null, Validators.required],
    impuestoId: [null as number | null],
    categoriaId: [null as number | null],
    marcaId: [null as number | null],
    modeloId: [null as number | null],
    unidadMedidaId: [null as number | null],
    // la columna ubicacion es varchar(10) en la base -- sin este límite el guardado
    // revienta con un 409 genérico en vez de avisar en el formulario
    ubicacion: ['', Validators.maxLength(10)],
    peso: [null as number | null],
    precios: this.fb.array([this.crearFilaPrecio()]),
  });

  ngOnInit(): void {
    forkJoin({
      monedas: this.catalogoService.listar('monedas'),
      categorias: this.catalogoService.listar('categorias'),
      marcas: this.catalogoService.listar('marcas'),
      unidadesMedida: this.catalogoService.listar<UnidadMedidaOpcion>('unidades-medida'),
      impuestos: this.catalogoService.listar<ImpuestoOpcion>('impuestos'),
      listasPrecio: this.catalogoService.listar('listas-precio'),
    }).subscribe(({ monedas, categorias, marcas, unidadesMedida, impuestos, listasPrecio }) => {
      this.monedas.set(monedas);
      this.categorias.set(categorias);
      this.marcas.set(marcas);
      this.unidadesMedida.set(unidadesMedida);
      this.impuestos.set(impuestos);
      this.listasPrecio.set(listasPrecio);
    });

    // el modelo depende de la marca elegida (ModeloController filtra por marcaId) -- formControlName
    // no dispara (ngModelChange), hay que suscribirse a valueChanges del control
    this.formulario.controls.marcaId.valueChanges.subscribe((marcaId) => this.alCambiarMarca(marcaId));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.productoId.set(Number(id));
    this.productoService.obtener(Number(id)).subscribe((producto) => {
      this.imagenUrl.set(producto.imagenUrl);

      this.precios.clear();
      for (const precio of producto.precios) {
        this.precios.push(this.crearFilaPrecio(precio.listaPrecioId, precio.precio));
      }
      if (this.precios.length === 0) {
        this.precios.push(this.crearFilaPrecio());
      }

      const aplicarDatos = () => {
        // emitEvent: false -- si no, dispara el valueChanges de marcaId de arriba
        // y resetea modeloId justo después de habérselo asignado
        this.formulario.patchValue(
          {
            codigoBarras: producto.codigoBarras,
            codigo: producto.codigo,
            codigoFabricante: producto.codigoFabricante ?? '',
            nombre: producto.nombre,
            costo: producto.costo,
            stockMinimo: producto.stockMinimo,
            tipo: producto.tipo,
            monedaId: producto.monedaId,
            impuestoId: producto.impuestoId,
            categoriaId: producto.categoriaId,
            marcaId: producto.marcaId,
            modeloId: producto.modeloId,
            unidadMedidaId: producto.unidadMedidaId,
            ubicacion: producto.ubicacion ?? '',
            peso: producto.peso,
          },
          { emitEvent: false },
        );
      };

      if (producto.marcaId) {
        this.catalogoService
          .listar<ModeloOpcion>('modelos', { marcaId: producto.marcaId })
          .subscribe((modelos) => {
            this.modelos.set(modelos);
            aplicarDatos();
          });
      } else {
        aplicarDatos();
      }
    });
  }

  get precios(): FormArray {
    return this.formulario.controls.precios;
  }

  agregarPrecio(): void {
    this.precios.push(this.crearFilaPrecio());
  }

  quitarPrecio(indice: number): void {
    if (this.precios.length > 1) {
      this.precios.removeAt(indice);
    }
  }

  subirImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    this.subiendoImagen.set(true);
    this.error.set(null);
    this.archivoService.subir(archivo).subscribe({
      next: (respuesta) => {
        this.imagenUrl.set(respuesta.url);
        this.subiendoImagen.set(false);
        input.value = '';
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo subir la imagen'));
        this.subiendoImagen.set(false);
        input.value = '';
      },
    });
  }

  quitarImagen(): void {
    this.imagenUrl.set(null);
  }

  urlImagen(url: string): string {
    return this.archivoService.resolverUrl(url);
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();
    // el cast es seguro acá: si el formulario es válido, listaPrecioId (el único campo que
    // el form tipa como `| null` por el valor inicial) ya no puede ser null -- Validators.required lo garantiza
    const precios = valores.precios as unknown as PrecioRequest[];
    const payload: ProductoRequest = {
      codigoBarras: valores.codigoBarras,
      codigo: valores.codigo,
      codigoFabricante: valores.codigoFabricante.trim() || null,
      nombre: valores.nombre,
      costo: valores.costo,
      stockMinimo: valores.stockMinimo,
      tipo: valores.tipo,
      monedaId: valores.monedaId!,
      impuestoId: valores.impuestoId,
      imagenUrl: this.imagenUrl(),
      categoriaId: valores.categoriaId,
      marcaId: valores.marcaId,
      modeloId: valores.modeloId,
      unidadMedidaId: valores.unidadMedidaId,
      ubicacion: valores.ubicacion.trim() || null,
      peso: valores.peso,
      precios,
    };

    const id = this.productoId();
    const peticion = id ? this.productoService.actualizar(id, payload) : this.productoService.crear(payload);

    peticion.subscribe({
      next: () => this.router.navigateByUrl('/productos'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el producto -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  private alCambiarMarca(marcaId: number | null): void {
    this.formulario.controls.modeloId.setValue(null);
    if (!marcaId) {
      this.modelos.set([]);
      return;
    }
    this.catalogoService.listar<ModeloOpcion>('modelos', { marcaId }).subscribe((modelos) => this.modelos.set(modelos));
  }

  private crearFilaPrecio(listaPrecioId: number | null = null, precio = 0) {
    return this.fb.nonNullable.group({
      listaPrecioId: [listaPrecioId, Validators.required],
      precio: [precio, [Validators.required, Validators.min(0)]],
    });
  }
}
