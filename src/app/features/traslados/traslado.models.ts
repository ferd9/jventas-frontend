import { EstadoTraslado } from '../../core/models/estado-traslado';

export interface DetalleTrasladoRequest {
  productoId: number;
  cantidad: number;
}

export interface TrasladoRequest {
  almacenOrigenId: number;
  almacenDestinoId: number;
  observaciones?: string | null;
  detalles: DetalleTrasladoRequest[];
}

export interface TrasladoResumenResponse {
  id: number;
  almacenOrigenNombre: string;
  almacenDestinoNombre: string;
  estado: EstadoTraslado;
  fecha: string;
}

export interface DetalleTrasladoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export interface TrasladoDetalleResponse {
  id: number;
  almacenOrigenId: number;
  almacenOrigenNombre: string;
  almacenDestinoId: number;
  almacenDestinoNombre: string;
  usuarioNombre: string;
  estado: EstadoTraslado;
  observaciones: string | null;
  fecha: string;
  detalles: DetalleTrasladoResponse[];
}
