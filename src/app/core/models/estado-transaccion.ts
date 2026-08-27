/** Espejo del enum nativo de Postgres `estado_transaccion`. CANCELADO = pagado/liquidado, no anulado. */
export type EstadoTransaccion = 'PENDIENTE' | 'CANCELADO' | 'ANULADO';

export const ESTADO_TRANSACCION_LABEL: Record<EstadoTransaccion, string> = {
  PENDIENTE: 'Pendiente',
  CANCELADO: 'Cancelado',
  ANULADO: 'Anulado',
};

export const ESTADO_TRANSACCION_COLOR: Record<EstadoTransaccion, string> = {
  PENDIENTE: 'warning',
  CANCELADO: 'success',
  ANULADO: 'default',
};
