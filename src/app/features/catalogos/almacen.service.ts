import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlmacenRequest, AlmacenResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private readonly base = `${environment.apiUrl}/almacenes`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<AlmacenResponse[]> {
    return this.http.get<AlmacenResponse[]>(this.base);
  }

  obtener(id: number): Observable<AlmacenResponse> {
    return this.http.get<AlmacenResponse>(`${this.base}/${id}`);
  }

  crear(request: AlmacenRequest): Observable<AlmacenResponse> {
    return this.http.post<AlmacenResponse>(this.base, request);
  }

  actualizar(id: number, request: AlmacenRequest): Observable<AlmacenResponse> {
    return this.http.put<AlmacenResponse>(`${this.base}/${id}`, request);
  }

  // soft-delete -- pone activo=false, no hay endpoint de reactivar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
