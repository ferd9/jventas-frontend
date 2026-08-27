export interface DevolucionLineaRequest {
  detalleVentaId: number;
  cantidad: number;
  /** Obligatorio (y del mismo tamaño que cantidad) solo si el producto de esa línea exige serie. */
  numerosSerie?: string[] | null;
}

export interface DevolucionRequest {
  motivo?: string | null;
  lineas: DevolucionLineaRequest[];
}

export interface DetalleDevolucionResponse {
  id: number;
  detalleVentaId: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  monto: number;
  montoImpuesto: number;
}

export interface DevolucionResponse {
  id: number;
  ventaId: number;
  usuarioLogin: string;
  fecha: string;
  motivo: string | null;
  montoTotal: number;
  lineas: DetalleDevolucionResponse[];
}
