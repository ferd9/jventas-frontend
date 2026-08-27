import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaRequest, CategoriaResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly base = `${environment.apiUrl}/categorias`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(this.base);
  }

  crear(request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(this.base, request);
  }

  actualizar(id: number, request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.base}/${id}`, request);
  }
}
