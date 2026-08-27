import { EstadoTransaccion } from '../../core/models/estado-transaccion';

export interface DetalleCompraRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number | null;
  impuestoId?: number | null;
  /** Obligatorio (y del mismo tamaño que cantidad) solo si la categoría del producto exige serie. */
  numerosSerie?: string[] | null;
}

/** Espejo de CompraRequest. Si serieDocumentoId viene, el backend genera el correlativo solo e ignora numeroDocumento. */
export interface CompraRequest {
  tipoDocumentoId: number;
  numeroDocumento: string;
  serieDocumentoId?: number | null;
  proveedorId: number;
  almacenId: number;
  monedaId: number;
  fechaVencimiento?: string | null;
  observaciones?: string | null;
  detalles: DetalleCompraRequest[];
}

export interface CompraResumenResponse {
  id: number;
  numeroDocumento: string;
  proveedorRazonSocial: string;
  estado: EstadoTransaccion;
  total: number;
  fecha: string;
}

export interface DetalleCompraResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  montoImpuesto: number;
  subtotal: number;
}

export interface CompraDetalleResponse {
  id: number;
  tipoDocumentoNombre: string;
  numeroDocumento: string;
  proveedorId: number;
  proveedorRazonSocial: string;
  usuarioNombre: string;
  almacenId: number;
  almacenNombre: string;
  monedaId: number;
  monedaNombre: string;
  estado: EstadoTransaccion;
  fechaVencimiento: string | null;
  observaciones: string | null;
  subtotal: number;
  igv: number;
  total: number;
  fecha: string;
  detalles: DetalleCompraResponse[];
}
