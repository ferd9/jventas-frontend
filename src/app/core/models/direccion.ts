/** Espejo de DireccionRequest/DireccionResponse -- lo usan Cliente y Proveedor. */
export interface DireccionRequest {
  pais?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  direccionLinea: string;
  referencia?: string | null;
}

export interface DireccionResponse {
  id: number;
  pais: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  direccionLinea: string;
  referencia: string | null;
}
