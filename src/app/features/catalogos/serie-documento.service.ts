import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SerieDocumentoRequest, SerieDocumentoResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class SerieDocumentoService {
  private readonly base = `${environment.apiUrl}/series-documento`;

  constructor(private readonly http: HttpClient) {}

  // el backend exige ambos parámetros -- no hay forma de listar todas las series de una
  listar(almacenId: number, tipoDocumentoId: number): Observable<SerieDocumentoResponse[]> {
    const params = new HttpParams().set('almacenId', almacenId).set('tipoDocumentoId', tipoDocumentoId);
    return this.http.get<SerieDocumentoResponse[]>(this.base, { params });
  }

  crear(request: SerieDocumentoRequest): Observable<SerieDocumentoResponse> {
    return this.http.post<SerieDocumentoResponse>(this.base, request);
  }
}
