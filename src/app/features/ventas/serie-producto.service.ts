import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SerieProductoResponse } from './serie-producto.models';

/** El vendedor elige manualmente qué serie sale al vender -- decisión de negocio, ver SerieProductoController. */
@Injectable({ providedIn: 'root' })
export class SerieProductoService {
  private readonly base = `${environment.apiUrl}/series-producto`;

  constructor(private readonly http: HttpClient) {}

  listarDisponibles(productoId: number, almacenId: number): Observable<SerieProductoResponse[]> {
    const params = new HttpParams().set('productoId', productoId).set('almacenId', almacenId);
    return this.http.get<SerieProductoResponse[]>(this.base, { params });
  }
}
