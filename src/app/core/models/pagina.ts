/** Espejo de lo que serializa Spring Data Page<T> -- solo los campos que la UI realmente necesita. */
export interface PaginaRespuesta<T> {
  content: T[];
  totalElements: number;
  number: number; // página actual, 0-indexada
  size: number;
}
