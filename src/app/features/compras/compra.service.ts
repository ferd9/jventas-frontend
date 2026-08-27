import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { CompraDetalleResponse, CompraRequest, CompraResumenResponse } from './compra.models';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly base = `${environment.apiUrl}/compras`;

  constructor(private readonly http: HttpClient) {}

  listar(
    proveedorId: number | null,
    fechaDesde: string | null,
    fechaHasta: string | null,
    pagina: number,
    tamano: number,
  ): Observable<PaginaRespuesta<CompraResumenResponse>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano).set('sort', 'fecha,desc');
    if (proveedorId) {
      params = params.set('proveedorId', proveedorId);
    }
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }
    return this.http.get<PaginaRespuesta<CompraResumenResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<CompraDetalleResponse> {
    return this.http.get<CompraDetalleResponse>(`${this.base}/${id}`);
  }

  crear(request: CompraRequest): Observable<CompraDetalleResponse> {
    return this.http.post<CompraDetalleResponse>(this.base, request);
  }

  anular(id: number): Observable<CompraDetalleResponse> {
    return this.http.post<CompraDetalleResponse>(`${this.base}/${id}/anular`, {});
  }
}
