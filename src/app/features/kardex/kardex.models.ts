/** Espejo del enum nativo de Postgres `tipo_documento_kardex` -- interno del sistema, no editable por el usuario. */
export type TipoDocumentoKardex =
  | 'APERTURA'
  | 'COMPRA'
  | 'COMPRA_ACTUALIZACION'
  | 'PRODUCTO_ELIMINADO_COMPRA'
  | 'VENTA'
  | 'VENTA_ACTUALIZACION'
  | 'PRODUCTO_ELIMINADO_VENTA'
  | 'TRASLADO_SALIDA'
  | 'TRASLADO_ENTRADA'
  | 'DEVOLUCION_VENTA'
  | 'DEVOLUCION_COMPRA';

export const TIPO_KARDEX_LABEL: Record<TipoDocumentoKardex, string> = {
  APERTURA: 'Apertura',
  COMPRA: 'Compra',
  COMPRA_ACTUALIZACION: 'Actualización de compra',
  PRODUCTO_ELIMINADO_COMPRA: 'Reverso de compra',
  VENTA: 'Venta',
  VENTA_ACTUALIZACION: 'Actualización de venta',
  PRODUCTO_ELIMINADO_VENTA: 'Reverso de venta',
  TRASLADO_SALIDA: 'Traslado (salida)',
  TRASLADO_ENTRADA: 'Traslado (entrada)',
  DEVOLUCION_VENTA: 'Devolución de venta',
  DEVOLUCION_COMPRA: 'Devolución a proveedor',
};

/** Espejo de KardexResponse. */
export interface KardexResponse {
  id: number;
  fecha: string;
  tipoDocumento: TipoDocumentoKardex;
  numeroDocumento: string;
  entrada: number;
  salida: number;
  precio: number;
  valor: number;
  costoUnitario: number;
  costoTotal: number;
  stockResultante: number;
  valorTotal: number;
}

/** Espejo de AlmacenStockResponse. */
export interface AlmacenStockResponse {
  almacenId: number;
  almacenNombre: string;
  productoId: number;
  productoNombre: string;
  cantidadActual: number;
  actualizadoEn: string;
}
