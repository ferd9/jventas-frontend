import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPagoRequest, MetodoPagoResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private readonly base = `${environment.apiUrl}/metodos-pago`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<MetodoPagoResponse[]> {
    return this.http.get<MetodoPagoResponse[]>(this.base);
  }

  crear(request: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.post<MetodoPagoResponse>(this.base, request);
  }

  actualizar(id: number, request: MetodoPagoRequest): Observable<MetodoPagoResponse> {
    return this.http.put<MetodoPagoResponse>(`${this.base}/${id}`, request);
  }
}
