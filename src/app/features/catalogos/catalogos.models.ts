import { DireccionRequest, DireccionResponse } from '../../core/models/direccion';

export interface CategoriaRequest {
  nombre: string;
  categoriaPadreId?: number | null;
  requiereSerie: boolean;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  categoriaPadreId: number | null;
  requiereSerie: boolean;
}

export interface MarcaRequest {
  nombre: string;
}

export interface MarcaResponse {
  id: number;
  nombre: string;
}

export interface ListaPrecioRequest {
  nombre: string;
}

export interface ListaPrecioResponse {
  id: number;
  nombre: string;
}

/** Solo lectura -- el backend no expone crear/editar moneda (ver MonedaController). */
export interface MonedaResponse {
  id: number;
  nombre: string;
  simbolo: string;
  codigoIso: string;
  predeterminada: boolean;
}

export interface AlmacenRequest {
  nombre: string;
  direccion: DireccionRequest;
}

export interface AlmacenResponse {
  id: number;
  nombre: string;
  direccion: DireccionResponse;
  activo: boolean;
}

export type TipoCargoAlmacen = 'LIDER' | 'EMPLEADO';

export const TIPOS_CARGO_ALMACEN: { valor: TipoCargoAlmacen; etiqueta: string }[] = [
  { valor: 'LIDER', etiqueta: 'Líder' },
  { valor: 'EMPLEADO', etiqueta: 'Empleado' },
];

export interface EncargadoAlmacenRequest {
  usuarioId: number;
  almacenId: number;
  tipoCargo: TipoCargoAlmacen;
}

export interface EncargadoAlmacenResponse {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  almacenId: number;
  almacenNombre: string;
  tipoCargo: TipoCargoAlmacen;
}

export interface TipoDocumentoRequest {
  nombre: string;
  aplicaCompra: boolean;
  aplicaVenta: boolean;
}

export interface TipoDocumentoResponse {
  id: number;
  nombre: string;
  aplicaCompra: boolean;
  aplicaVenta: boolean;
}

export interface ImpuestoRequest {
  nombre: string;
  tasa: number;
  esDefault: boolean;
}

export interface ImpuestoResponse {
  id: number;
  nombre: string;
  tasa: number;
  esDefault: boolean;
}

export interface MetodoPagoRequest {
  nombre: string;
}

export interface MetodoPagoResponse {
  id: number;
  nombre: string;
}

export interface ModeloRequest {
  nombre: string;
  marcaId: number;
}

export interface ModeloResponse {
  id: number;
  nombre: string;
  marcaId: number;
}

export interface UnidadMedidaRequest {
  nombre: string;
  abreviatura?: string | null;
}

export interface UnidadMedidaResponse {
  id: number;
  nombre: string;
  abreviatura: string | null;
}

export interface SerieDocumentoRequest {
  almacenId: number;
  tipoDocumentoId: number;
  serie: string;
}

export interface SerieDocumentoResponse {
  id: number;
  almacenId: number;
  almacenNombre: string;
  tipoDocumentoId: number;
  tipoDocumentoNombre: string;
  serie: string;
  correlativoActual: number;
  /** Cómo quedaría el próximo comprobante emitido con esta serie -- no consume el correlativo, solo lo muestra. */
  proximoNumero: string;
}

/** Lectura abierta a cualquier autenticado (lo necesita el formulario de creación de usuario); escritura solo con usuario:administrar. */
export interface CargoRequest {
  nombre: string;
}

export interface CargoResponse {
  id: number;
  nombre: string;
  activo: boolean;
}
