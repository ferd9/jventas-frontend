export interface CuentaPorCobrarResponse {
  ventaId: number;
  numeroDocumento: string;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  fechaVencimiento: string | null;
  vencido: boolean;
  total: number;
  pagado: number;
  saldo: number;
}

export interface CuentaPorPagarResponse {
  compraId: number;
  numeroDocumento: string;
  proveedorId: number;
  proveedorRazonSocial: string;
  fecha: string;
  fechaVencimiento: string | null;
  vencido: boolean;
  total: number;
  pagado: number;
  saldo: number;
}
