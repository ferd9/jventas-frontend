import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlmacenStockResponse } from '../kardex/kardex.models';
import { AperturaRequest } from './apertura.models';

@Injectable({ providedIn: 'root' })
export class AperturaService {
  private readonly base = `${environment.apiUrl}/aperturas`;

  constructor(private readonly http: HttpClient) {}

  // devuelve el stock resultante de cada línea recién cargada -- no hay "listar aperturas", es una acción, no una entidad con historial propio
  registrar(request: AperturaRequest): Observable<AlmacenStockResponse[]> {
    return this.http.post<AlmacenStockResponse[]>(this.base, request);
  }
}
