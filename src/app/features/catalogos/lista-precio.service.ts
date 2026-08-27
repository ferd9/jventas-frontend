import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListaPrecioRequest, ListaPrecioResponse } from './catalogos.models';

@Injectable({ providedIn: 'root' })
export class ListaPrecioService {
  private readonly base = `${environment.apiUrl}/listas-precio`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ListaPrecioResponse[]> {
    return this.http.get<ListaPrecioResponse[]>(this.base);
  }

  crear(request: ListaPrecioRequest): Observable<ListaPrecioResponse> {
    return this.http.post<ListaPrecioResponse>(this.base, request);
  }

  actualizar(id: number, request: ListaPrecioRequest): Observable<ListaPrecioResponse> {
    return this.http.put<ListaPrecioResponse>(`${this.base}/${id}`, request);
  }
}
