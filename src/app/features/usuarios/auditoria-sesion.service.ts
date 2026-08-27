import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditoriaSesionResponse } from './auditoria-sesion.models';

@Injectable({ providedIn: 'root' })
export class AuditoriaSesionService {
  private readonly base = `${environment.apiUrl}/auditoria-sesion`;

  constructor(private readonly http: HttpClient) {}

  listar(usuarioId: number): Observable<AuditoriaSesionResponse[]> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.get<AuditoriaSesionResponse[]>(this.base, { params });
  }
}
