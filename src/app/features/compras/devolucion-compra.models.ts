export interface DevolucionCompraLineaRequest {
  detalleCompraId: number;
  cantidad: number;
  /** Obligatorio (y del mismo tamaño que cantidad) solo si el producto de esa línea exige serie. */
  numerosSerie?: string[] | null;
}

export interface DevolucionCompraRequest {
  motivo?: string | null;
  lineas: DevolucionCompraLineaRequest[];
}

export interface DetalleDevolucionCompraResponse {
  id: number;
  detalleCompraId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  monto: number;
  montoImpuesto: number;
}

export interface DevolucionCompraResponse {
  id: number;
  compraId: number;
  usuarioLogin: string;
  fecha: string;
  motivo: string | null;
  montoTotal: number;
  lineas: DetalleDevolucionCompraResponse[];
}
