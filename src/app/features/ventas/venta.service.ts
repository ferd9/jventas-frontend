import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { VentaDetalleResponse, VentaRequest, VentaResumenResponse } from './venta.models';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly base = `${environment.apiUrl}/ventas`;

  constructor(private readonly http: HttpClient) {}

  listar(
    clienteId: number | null,
    fechaDesde: string | null,
    fechaHasta: string | null,
    pagina: number,
    tamano: number,
  ): Observable<PaginaRespuesta<VentaResumenResponse>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano).set('sort', 'fecha,desc');
    if (clienteId) {
      params = params.set('clienteId', clienteId);
    }
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }
    return this.http.get<PaginaRespuesta<VentaResumenResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<VentaDetalleResponse> {
    return this.http.get<VentaDetalleResponse>(`${this.base}/${id}`);
  }

  crear(request: VentaRequest): Observable<VentaDetalleResponse> {
    return this.http.post<VentaDetalleResponse>(this.base, request);
  }

  anular(id: number): Observable<VentaDetalleResponse> {
    return this.http.post<VentaDetalleResponse>(`${this.base}/${id}/anular`, {});
  }
}
