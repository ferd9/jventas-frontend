/** Solo lectura -- los permisos son código real (@PreAuthorize en el backend), no algo que se pueda inventar desde acá. */
export interface PermisoResponse {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface RolRequest {
  nombre: string;
  descripcion?: string | null;
  permisoIds: number[];
}

export interface RolResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  permisos: PermisoResponse[];
}
