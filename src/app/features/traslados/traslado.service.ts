import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { TrasladoDetalleResponse, TrasladoRequest, TrasladoResumenResponse } from './traslado.models';

@Injectable({ providedIn: 'root' })
export class TrasladoService {
  private readonly base = `${environment.apiUrl}/traslados`;

  constructor(private readonly http: HttpClient) {}

  listar(pagina: number, tamano: number): Observable<PaginaRespuesta<TrasladoResumenResponse>> {
    const params = new HttpParams().set('page', pagina).set('size', tamano).set('sort', 'fecha,desc');
    return this.http.get<PaginaRespuesta<TrasladoResumenResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<TrasladoDetalleResponse> {
    return this.http.get<TrasladoDetalleResponse>(`${this.base}/${id}`);
  }

  crear(request: TrasladoRequest): Observable<TrasladoDetalleResponse> {
    return this.http.post<TrasladoDetalleResponse>(this.base, request);
  }

  completar(id: number): Observable<TrasladoDetalleResponse> {
    return this.http.post<TrasladoDetalleResponse>(`${this.base}/${id}/completar`, {});
  }

  anular(id: number): Observable<TrasladoDetalleResponse> {
    return this.http.post<TrasladoDetalleResponse>(`${this.base}/${id}/anular`, {});
  }
}
