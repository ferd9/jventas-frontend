import { DireccionRequest, DireccionResponse } from '../../core/models/direccion';

export type TipoCliente = 'NATURAL' | 'JURIDICA';
export type SexoPersona = 'H' | 'M';

export const TIPOS_CLIENTE: { valor: TipoCliente; etiqueta: string }[] = [
  { valor: 'NATURAL', etiqueta: 'Persona natural' },
  { valor: 'JURIDICA', etiqueta: 'Persona jurídica' },
];

export const SEXOS: { valor: SexoPersona; etiqueta: string }[] = [
  { valor: 'H', etiqueta: 'Hombre' },
  { valor: 'M', etiqueta: 'Mujer' },
];

/** Espejo de ClienteRequest. El backend exige RUC o DNI (al menos uno). */
export interface ClienteRequest {
  ruc?: string | null;
  dni?: string | null;
  nombre: string;
  apellidos: string;
  tipo: TipoCliente;
  direccion?: DireccionRequest | null;
  email?: string | null;
  telefono?: string | null;
  celular?: string | null;
  sexo?: SexoPersona | null;
}

/** Espejo de ClienteResponse. */
export interface ClienteResponse {
  id: number;
  ruc: string | null;
  dni: string | null;
  nombre: string;
  apellidos: string;
  tipo: TipoCliente;
  direccion: DireccionResponse | null;
  email: string | null;
  telefono: string | null;
  celular: string | null;
  sexo: SexoPersona | null;
  activo: boolean;
}
