import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ArchivoResponse {
  url: string;
}

/**
 * Sube archivos genéricos (por ahora solo imágenes de producto) a
 * /api/archivos. El backend devuelve una url relativa (/api/archivos/xxx.jpg)
 * que hay que resolver contra el host del backend, no el del frontend --
 * de ahí resolverUrl().
 */
@Injectable({ providedIn: 'root' })
export class ArchivoService {
  private readonly base = `${environment.apiUrl}/archivos`;

  constructor(private readonly http: HttpClient) {}

  subir(archivo: File): Observable<ArchivoResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ArchivoResponse>(this.base, formData);
  }

  /** environment.apiUrl termina en /api y la url que devuelve el backend ya empieza con /api/archivos/... */
  resolverUrl(url: string): string {
    return environment.apiUrl.replace(/\/api\/?$/, '') + url;
  }
}
