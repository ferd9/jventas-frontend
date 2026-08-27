import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { ProductoDetalle, ProductoRequest, ProductoResumen } from './producto.models';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly base = `${environment.apiUrl}/productos`;

  constructor(private readonly http: HttpClient) {}

  listar(q: string | null, pagina: number, tamano: number): Observable<PaginaRespuesta<ProductoResumen>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<PaginaRespuesta<ProductoResumen>>(this.base, { params });
  }

  obtener(id: number): Observable<ProductoDetalle> {
    return this.http.get<ProductoDetalle>(`${this.base}/${id}`);
  }

  crear(request: ProductoRequest): Observable<ProductoDetalle> {
    return this.http.post<ProductoDetalle>(this.base, request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<ProductoDetalle> {
    return this.http.put<ProductoDetalle>(`${this.base}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
