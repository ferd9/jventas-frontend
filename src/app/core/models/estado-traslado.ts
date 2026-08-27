/** Espejo del enum nativo de Postgres `estado_traslado`. */
export type EstadoTraslado = 'PENDIENTE' | 'COMPLETADO' | 'ANULADO';

export const ESTADO_TRASLADO_LABEL: Record<EstadoTraslado, string> = {
  PENDIENTE: 'Pendiente',
  COMPLETADO: 'Completado',
  ANULADO: 'Anulado',
};

export const ESTADO_TRASLADO_COLOR: Record<EstadoTraslado, string> = {
  PENDIENTE: 'warning',
  COMPLETADO: 'success',
  ANULADO: 'default',
};
