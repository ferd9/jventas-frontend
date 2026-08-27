import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RolRequest, RolResponse } from './rol.models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly base = `${environment.apiUrl}/roles`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(this.base);
  }

  crear(request: RolRequest): Observable<RolResponse> {
    return this.http.post<RolResponse>(this.base, request);
  }

  actualizar(id: number, request: RolRequest): Observable<RolResponse> {
    return this.http.put<RolResponse>(`${this.base}/${id}`, request);
  }
}
