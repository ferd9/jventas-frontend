import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CargoRequest, CargoResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class CargoService {
  private readonly base = `${environment.apiUrl}/cargos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<CargoResponse[]> {
    return this.http.get<CargoResponse[]>(this.base);
  }

  crear(request: CargoRequest): Observable<CargoResponse> {
    return this.http.post<CargoResponse>(this.base, request);
  }

  actualizar(id: number, request: CargoRequest): Observable<CargoResponse> {
    return this.http.put<CargoResponse>(`${this.base}/${id}`, request);
  }
}
