import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UnidadMedidaRequest, UnidadMedidaResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class UnidadMedidaService {
  private readonly base = `${environment.apiUrl}/unidades-medida`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<UnidadMedidaResponse[]> {
    return this.http.get<UnidadMedidaResponse[]>(this.base);
  }

  crear(request: UnidadMedidaRequest): Observable<UnidadMedidaResponse> {
    return this.http.post<UnidadMedidaResponse>(this.base, request);
  }

  actualizar(id: number, request: UnidadMedidaRequest): Observable<UnidadMedidaResponse> {
    return this.http.put<UnidadMedidaResponse>(`${this.base}/${id}`, request);
  }
}
