import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae el mensaje de negocio que arma ApiExceptionHandler ({..., message, ...})
 * en vez de mostrar siempre un texto genérico -- importa cuando el error viene
 * de una regla de negocio real (p.ej. "El cliente necesita RUC o DNI") y no
 * solo de una validación de formulario que ya se marcó en los campos.
 */
export function mensajeError(error: unknown, generico: string): string {
  if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
    return error.error.message;
  }
  return generico;
}
