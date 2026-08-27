import { DireccionRequest, DireccionResponse } from '../../core/models/direccion';

/** Espejo de ProveedorRequest. A diferencia de Cliente, dirección es obligatoria. */
export interface ProveedorRequest {
  ruc: string;
  razonSocial: string;
  direccion: DireccionRequest;
  telefono?: string | null;
  telefonoAlternativo?: string | null;
  cuentaBancaria?: string | null;
  nombreContacto?: string | null;
  email?: string | null;
  rubro?: string | null;
}

/** Espejo de ProveedorResponse. */
export interface ProveedorResponse {
  id: number;
  ruc: string;
  razonSocial: string;
  direccion: DireccionResponse;
  telefono: string | null;
  telefonoAlternativo: string | null;
  cuentaBancaria: string | null;
  nombreContacto: string | null;
  email: string | null;
  rubro: string | null;
  activo: boolean;
}
