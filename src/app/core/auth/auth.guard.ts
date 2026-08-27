import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

/**
 * Uso: { path: 'productos', canActivate: [authGuard, permisoGuard], data: { permiso: 'producto:ver' } }
 * Si la ruta no declara `permiso`, deja pasar -- protegerla es responsabilidad de authGuard, no de esta.
 */
export const permisoGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const permisoRequerido = route.data['permiso'] as string | undefined;
  if (!permisoRequerido || authService.tienePermiso(permisoRequerido)) {
    return true;
  }
  return router.createUrlTree(['/sin-permiso']);
};
