import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { ProveedorRequest, ProveedorResponse } from './proveedor.models';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly base = `${environment.apiUrl}/proveedores`;

  constructor(private readonly http: HttpClient) {}

  listar(q: string | null, pagina: number, tamano: number): Observable<PaginaRespuesta<ProveedorResponse>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<PaginaRespuesta<ProveedorResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<ProveedorResponse> {
    return this.http.get<ProveedorResponse>(`${this.base}/${id}`);
  }

  crear(request: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(this.base, request);
  }

  actualizar(id: number, request: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.put<ProveedorResponse>(`${this.base}/${id}`, request);
  }

  desactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/desactivar`, {});
  }

  reactivar(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/reactivar`, {});
  }
}
