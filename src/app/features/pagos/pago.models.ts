/** Exactamente uno de compraId/ventaId debe venir -- ver PagoRequest.esOrigenValido() en el backend. */
export interface PagoRequest {
  compraId?: number | null;
  ventaId?: number | null;
  metodoPagoId: number;
  monto: number;
  referencia?: string | null;
}

export interface PagoResponse {
  id: number;
  compraId: number | null;
  ventaId: number | null;
  metodoPagoNombre: string;
  monto: number;
  fechaPago: string;
  referencia: string | null;
}

export interface SaldoResponse {
  total: number;
  pagado: number;
  saldo: number;
}
