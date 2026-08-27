import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { ClienteRequest, ClienteResponse } from './cliente.models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly base = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {}

  listar(q: string | null, pagina: number, tamano: number): Observable<PaginaRespuesta<ClienteResponse>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<PaginaRespuesta<ClienteResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.base}/${id}`);
  }

  crear(request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.base, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.base}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/desactivar`, {});
  }

  reactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reactivar`, {});
  }
}
