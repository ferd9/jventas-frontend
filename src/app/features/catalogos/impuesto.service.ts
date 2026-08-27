import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImpuestoRequest, ImpuestoResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class ImpuestoService {
  private readonly base = `${environment.apiUrl}/impuestos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ImpuestoResponse[]> {
    return this.http.get<ImpuestoResponse[]>(this.base);
  }

  crear(request: ImpuestoRequest): Observable<ImpuestoResponse> {
    return this.http.post<ImpuestoResponse>(this.base, request);
  }

  actualizar(id: number, request: ImpuestoRequest): Observable<ImpuestoResponse> {
    return this.http.put<ImpuestoResponse>(`${this.base}/${id}`, request);
  }
}
