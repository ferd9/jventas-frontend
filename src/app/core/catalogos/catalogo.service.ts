import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OpcionCatalogo {
  id: number;
  nombre: string;
}

/**
 * Catálogos simples de apoyo (moneda, categoría, marca, lista de precio,
 * etc.) todos comparten la misma forma {id, nombre} para poblar selects --
 * un solo servicio genérico en vez de uno por catálogo.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  constructor(private readonly http: HttpClient) {}

  listar<T = OpcionCatalogo>(recurso: string, params?: Record<string, string | number>): Observable<T[]> {
    let httpParams = new HttpParams();
    for (const [clave, valor] of Object.entries(params ?? {})) {
      httpParams = httpParams.set(clave, valor);
    }
    return this.http.get<T[]>(`${environment.apiUrl}/${recurso}`, { params: httpParams });
  }
}
