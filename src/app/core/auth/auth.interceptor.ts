import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoginResponse } from './auth.models';

// rutas públicas -- nunca llevan el header, y si fallan con 401 no hay que
// intentar refrescar (login fallido es un 401 legítimo, no un token vencido)
const RUTAS_PUBLICAS = ['/auth/login', '/auth/refresh', '/auth/logout'];

// compartido entre requests -- si varias piden refresh casi al mismo tiempo
// (varias llamadas en paralelo que vencieron juntas), todas esperan el mismo
// refresh en vez de disparar uno cada una
let refrescoEnCurso: Observable<LoginResponse> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) => req.url.includes(ruta));
  const token = authService.tokenActual();

  const request = !esRutaPublica && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || esRutaPublica) {
        return throwError(() => error);
      }

      const refreshToken = authService.refreshTokenActual();
      if (!refreshToken) {
        authService.cerrarSesion();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      if (!refrescoEnCurso) {
        refrescoEnCurso = authService.refrescarToken(refreshToken);
      }

      return refrescoEnCurso.pipe(
        switchMap((respuesta) => {
          refrescoEnCurso = null;
          authService.actualizarToken(respuesta);
          const reintento = req.clone({ setHeaders: { Authorization: `Bearer ${respuesta.token}` } });
          return next(reintento);
        }),
        catchError((errorRefresh: unknown) => {
          refrescoEnCurso = null;
          authService.cerrarSesion();
          router.navigate(['/login']);
          return throwError(() => errorRefresh);
        }),
      );
    }),
  );
};
