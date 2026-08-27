import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CambiarPasswordRequest, LoginRequest, LoginResponse, SesionGuardada } from './auth.models';

const CLAVE_STORAGE = 'jventas.sesion';

/**
 * Sesión guardada en localStorage (no cookies -- el backend es stateless y
 * espera el token en el header Authorization, ver AuthInterceptor). Estado
 * reactivo vía signals para que el layout/guards reaccionen sin suscripciones
 * manuales.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sesion = signal<SesionGuardada | null>(this.leerSesionGuardada());

  readonly estaAutenticado = computed(() => this.sesion() !== null);
  readonly nombreCompleto = computed(() => this.sesion()?.nombreCompleto ?? '');
  readonly login = computed(() => this.sesion()?.login ?? '');
  readonly authorities = computed(() => this.sesion()?.authorities ?? []);

  constructor(private readonly http: HttpClient) {}

  iniciarSesion(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  cerrarSesion(): void {
    const actual = this.sesion();
    this.sesion.set(null);
    localStorage.removeItem(CLAVE_STORAGE);
    if (actual) {
      // best-effort -- si falla (sin red, token ya vencido) no bloquea el logout local
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken: actual.refreshToken }).subscribe({ error: () => {} });
    }
  }

  /** Lo usa el interceptor para reintentar tras un 401 -- no dispara tap() de guardarSesion para evitar un ciclo. */
  refrescarToken(refreshToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken });
  }

  actualizarToken(respuesta: LoginResponse): void {
    this.guardarSesion(respuesta);
  }

  tokenActual(): string | null {
    return this.sesion()?.token ?? null;
  }

  refreshTokenActual(): string | null {
    return this.sesion()?.refreshToken ?? null;
  }

  tienePermiso(codigo: string): boolean {
    return this.authorities().includes(codigo);
  }

  // self-service -- cualquier autenticado, sin permiso especial (ver UsuarioController.cambiarPasswordPropia)
  cambiarPassword(request: CambiarPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/usuarios/me/password`, request);
  }

  private guardarSesion(respuesta: LoginResponse): void {
    const nueva: SesionGuardada = {
      token: respuesta.token,
      refreshToken: respuesta.refreshToken,
      login: respuesta.login,
      nombreCompleto: respuesta.nombreCompleto,
      authorities: respuesta.authorities,
    };
    this.sesion.set(nueva);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nueva));
  }

  private leerSesionGuardada(): SesionGuardada | null {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) {
      return null;
    }
    try {
      return JSON.parse(crudo) as SesionGuardada;
    } catch {
      // storage corrupto (edición manual, versión vieja del formato) -- mejor arrancar sin sesión que reventar
      localStorage.removeItem(CLAVE_STORAGE);
      return null;
    }
  }
}
