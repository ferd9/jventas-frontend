import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ModeloRequest, ModeloResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class ModeloService {
  private readonly base = `${environment.apiUrl}/modelos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ModeloResponse[]> {
    return this.http.get<ModeloResponse[]>(this.base);
  }

  crear(request: ModeloRequest): Observable<ModeloResponse> {
    return this.http.post<ModeloResponse>(this.base, request);
  }

  actualizar(id: number, request: ModeloRequest): Observable<ModeloResponse> {
    return this.http.put<ModeloResponse>(`${this.base}/${id}`, request);
  }
}
