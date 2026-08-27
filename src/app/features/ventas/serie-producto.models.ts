/** Espejo de SerieProductoResponse -- series disponibles (sin vender) de un producto en un almacén. */
export interface SerieProductoResponse {
  id: number;
  numeroSerie: string;
  productoId: number;
  productoNombre: string;
  almacenId: number | null;
  almacenNombre: string | null;
  vendido: boolean;
}
