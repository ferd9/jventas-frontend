import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { ProductoPublico } from './catalogo-publico.models';

@Injectable({ providedIn: 'root' })
export class CatalogoPublicoService {
  private readonly base = `${environment.apiUrl}/publico/productos`;

  constructor(private readonly http: HttpClient) {}

  listar(q: string | null, pagina: number, tamano: number): Observable<PaginaRespuesta<ProductoPublico>> {
    let params = new HttpParams().set('page', pagina).set('size', tamano);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<PaginaRespuesta<ProductoPublico>>(this.base, { params });
  }
}
