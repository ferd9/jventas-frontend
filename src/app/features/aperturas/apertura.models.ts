export interface DetalleAperturaRequest {
  productoId: number;
  cantidad: number;
}

/** Espejo de AperturaRequest. Falla si el almacén ya tiene stock registrado de algún producto de la lista -- es solo para carga inicial. */
export interface AperturaRequest {
  almacenId: number;
  detalles: DetalleAperturaRequest[];
}
