/** Espejo de AuditoriaSesionResponse -- un registro por login exitoso. */
export interface AuditoriaSesionResponse {
  id: number;
  ipAddress: string | null;
  userAgent: string | null;
  fechaActividad: string;
}
