import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import {
  ResetearPasswordRequest,
  ResetearPasswordResponse,
  UsuarioActualizarRequest,
  UsuarioCrearRequest,
  UsuarioResponse,
} from './usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly base = `${environment.apiUrl}/usuarios`;

  constructor(private readonly http: HttpClient) {}

  listar(pagina: number, tamano: number): Observable<PaginaRespuesta<UsuarioResponse>> {
    const params = new HttpParams().set('page', pagina).set('size', tamano).set('sort', 'nombre,asc');
    return this.http.get<PaginaRespuesta<UsuarioResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.base}/${id}`);
  }

  crear(request: UsuarioCrearRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.base, request);
  }

  actualizar(id: number, request: UsuarioActualizarRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.base}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/desactivar`, {});
  }

  reactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reactivar`, {});
  }

  resetearPassword(id: number, request: ResetearPasswordRequest = {}): Observable<ResetearPasswordResponse> {
    return this.http.post<ResetearPasswordResponse>(`${this.base}/${id}/resetear-password`, request);
  }
}
