import { EstadoTransaccion } from '../../core/models/estado-transaccion';

export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPct?: number | null;
  impuestoId?: number | null;
  /** Obligatorio (y del mismo tamaño que cantidad) solo si la categoría del producto exige serie -- el vendedor elige manualmente cuáles salen. */
  numerosSerie?: string[] | null;
}

/** Espejo de VentaRequest. Si serieDocumentoId viene, el backend genera el correlativo solo e ignora numeroDocumento. */
export interface VentaRequest {
  tipoDocumentoId: number;
  numeroDocumento: string;
  serieDocumentoId?: number | null;
  clienteId: number;
  almacenId: number;
  monedaId: number;
  fechaVencimiento?: string | null;
  observaciones?: string | null;
  detalles: DetalleVentaRequest[];
}

export interface VentaResumenResponse {
  id: number;
  numeroDocumento: string;
  clienteNombre: string;
  estado: EstadoTransaccion;
  total: number;
  fecha: string;
}

export interface DetalleVentaResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  montoImpuesto: number;
  subtotal: number;
}

export interface VentaDetalleResponse {
  id: number;
  tipoDocumentoNombre: string;
  numeroDocumento: string;
  clienteId: number;
  clienteNombre: string;
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
  detalles: DetalleVentaResponse[];
}
