import { PrecioResponse } from '../productos/producto.models';

/** Espejo de ProductoPublicoResponse -- forma pública, sin costo ni stock exacto. */
export interface ProductoPublico {
  id: number;
  codigo: string;
  nombre: string;
  categoriaNombre: string | null;
  marcaNombre: string | null;
  monedaNombre: string;
  imagenUrl: string | null;
  disponible: boolean;
  precios: PrecioResponse[];
}
