import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonedaResponse } from './catalogos.models';

/** Solo lectura -- el backend no expone crear/editar moneda, ver MonedaController. */
@Injectable({ providedIn: 'root' })
export class MonedaService {
  private readonly base = `${environment.apiUrl}/monedas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<MonedaResponse[]> {
    return this.http.get<MonedaResponse[]>(this.base);
  }
}
