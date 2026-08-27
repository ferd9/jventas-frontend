import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoDocumentoRequest, TipoDocumentoResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class TipoDocumentoService {
  private readonly base = `${environment.apiUrl}/tipos-documento`;

  constructor(private readonly http: HttpClient) {}

  /** Sin aplicaA, el backend devuelve el catálogo completo (activos e inactivos) -- lo usa la página de administración. */
  listar(aplicaA?: 'compra' | 'venta'): Observable<TipoDocumentoResponse[]> {
    const params = aplicaA ? new HttpParams().set('aplicaA', aplicaA) : undefined;
    return this.http.get<TipoDocumentoResponse[]>(this.base, { params });
  }

  crear(request: TipoDocumentoRequest): Observable<TipoDocumentoResponse> {
    return this.http.post<TipoDocumentoResponse>(this.base, request);
  }

  actualizar(id: number, request: TipoDocumentoRequest): Observable<TipoDocumentoResponse> {
    return this.http.put<TipoDocumentoResponse>(`${this.base}/${id}`, request);
  }
}
