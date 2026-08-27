import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MarcaRequest, MarcaResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly base = `${environment.apiUrl}/marcas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<MarcaResponse[]> {
    return this.http.get<MarcaResponse[]>(this.base);
  }

  crear(request: MarcaRequest): Observable<MarcaResponse> {
    return this.http.post<MarcaResponse>(this.base, request);
  }

  actualizar(id: number, request: MarcaRequest): Observable<MarcaResponse> {
    return this.http.put<MarcaResponse>(`${this.base}/${id}`, request);
  }
}
