export interface LoginRequest {
  login: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

/** Espejo de LoginResponse del backend (seguridad/LoginResponse.java). */
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiraEnSegundos: number;
  refreshToken: string;
  login: string;
  nombreCompleto: string;
  authorities: string[];
}

/** Lo que se persiste en localStorage entre recargas de página. */
export interface SesionGuardada {
  token: string;
  refreshToken: string;
  login: string;
  nombreCompleto: string;
  authorities: string[];
}

/** Espejo de CambiarPasswordRequest -- self-service, cualquier autenticado, sin permiso especial. */
export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}
