import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EncargadoAlmacenRequest, EncargadoAlmacenResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class EncargadoAlmacenService {
  private readonly base = `${environment.apiUrl}/encargados-almacen`;

  constructor(private readonly http: HttpClient) {}

  porAlmacen(almacenId: number): Observable<EncargadoAlmacenResponse[]> {
    const params = new HttpParams().set('almacenId', almacenId);
    return this.http.get<EncargadoAlmacenResponse[]>(this.base, { params });
  }

  asignar(request: EncargadoAlmacenRequest): Observable<EncargadoAlmacenResponse> {
    return this.http.post<EncargadoAlmacenResponse>(this.base, request);
  }

  // soft-delete -- pone activo=false en la asignación, no en el usuario ni el almacén
  quitar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
