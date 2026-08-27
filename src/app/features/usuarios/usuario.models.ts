export type SexoPersona = 'H' | 'M';

export const SEXOS: { valor: SexoPersona; etiqueta: string }[] = [
  { valor: 'H', etiqueta: 'Hombre' },
  { valor: 'M', etiqueta: 'Mujer' },
];

export interface UsuarioCrearRequest {
  dni: string;
  codigo: string;
  login: string;
  nombre: string;
  apellidos: string;
  password: string;
  fechaNacimiento?: string | null;
  telefono: string;
  telefono2?: string | null;
  celular?: string | null;
  email?: string | null;
  sexo: SexoPersona;
  cargoId: number;
  descripcion?: string | null;
  rolIds?: number[] | null;
}

/** Sin password a propósito -- eso pasa por /me/password (propio) o /resetear-password (admin), nunca por acá. */
export interface UsuarioActualizarRequest {
  dni: string;
  codigo: string;
  login: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento?: string | null;
  telefono: string;
  telefono2?: string | null;
  celular?: string | null;
  email?: string | null;
  sexo: SexoPersona;
  cargoId: number;
  descripcion?: string | null;
  rolIds?: number[] | null;
}

export interface UsuarioResponse {
  id: number;
  dni: string;
  codigo: string;
  login: string;
  nombre: string;
  apellidos: string;
  fotoUrl: string | null;
  fechaNacimiento: string | null;
  telefono: string | null;
  telefono2: string | null;
  celular: string | null;
  email: string | null;
  sexo: SexoPersona | null;
  cargoId: number;
  cargoNombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaRegistro: string;
  /** Nombres de rol, no ids -- para prellenar el multi-select hay que cruzarlos contra el catálogo de roles por nombre. */
  roles: string[];
}

/** passwordNueva nula = se genera una aleatoria y se devuelve una sola vez en la respuesta. */
export interface ResetearPasswordRequest {
  passwordNueva?: string | null;
}

export interface ResetearPasswordResponse {
  passwordNueva: string;
}
