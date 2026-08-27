export type TipoProducto = 'PRODUCTO_TERMINADO' | 'COMPONENTE' | 'INSUMO';

export const TIPOS_PRODUCTO: { valor: TipoProducto; etiqueta: string }[] = [
  { valor: 'PRODUCTO_TERMINADO', etiqueta: 'Producto terminado' },
  { valor: 'COMPONENTE', etiqueta: 'Componente' },
  { valor: 'INSUMO', etiqueta: 'Insumo' },
];

/** Espejo de ProductoResumenResponse -- forma liviana que devuelve el listado. */
export interface ProductoResumen {
  id: number;
  codigo: string;
  codigoBarras: string;
  nombre: string;
  categoriaNombre: string | null;
  marcaNombre: string | null;
  activo: boolean;
}

export interface PrecioRequest {
  listaPrecioId: number;
  precio: number;
}

export interface PrecioResponse {
  listaPrecioId: number;
  listaPrecioNombre: string;
  precio: number;
}

/** Espejo de ProductoRequest -- lo que se manda al crear/editar. */
export interface ProductoRequest {
  codigoBarras: string;
  codigo: string;
  codigoFabricante?: string | null;
  nombre: string;
  costo: number;
  stockMinimo: number;
  tipo: TipoProducto;
  monedaId: number;
  impuestoId?: number | null;
  imagenUrl?: string | null;
  categoriaId?: number | null;
  marcaId?: number | null;
  modeloId?: number | null;
  unidadMedidaId?: number | null;
  ubicacion?: string | null;
  peso?: number | null;
  precios: PrecioRequest[];
}

/** Espejo de ProductoDetalleResponse. */
export interface ProductoDetalle {
  id: number;
  codigoBarras: string;
  codigo: string;
  codigoFabricante: string | null;
  nombre: string;
  costo: number;
  stockMinimo: number;
  tipo: TipoProducto;
  monedaId: number;
  impuestoId: number | null;
  imagenUrl: string | null;
  categoriaId: number | null;
  marcaId: number | null;
  modeloId: number | null;
  unidadMedidaId: number | null;
  ubicacion: string | null;
  peso: number | null;
  activo: boolean;
  precios: PrecioResponse[];
}

/** Espejo de ModeloResponse -- depende de una marca, por eso el marcaId. */
export interface ModeloOpcion {
  id: number;
  nombre: string;
  marcaId: number;
}

/** Espejo de UnidadMedidaResponse. */
export interface UnidadMedidaOpcion {
  id: number;
  nombre: string;
  abreviatura: string | null;
}

/** Espejo de ImpuestoResponse. */
export interface ImpuestoOpcion {
  id: number;
  nombre: string;
  tasa: number;
  esDefault: boolean;
}
