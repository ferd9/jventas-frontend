import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaRespuesta } from '../../core/models/pagina';
import { AlmacenStockResponse, KardexResponse } from './kardex.models';

@Injectable({ providedIn: 'root' })
export class KardexService {
  constructor(private readonly http: HttpClient) {}

  listar(almacenId: number, productoId: number, pagina: number, tamano: number): Observable<PaginaRespuesta<KardexResponse>> {
    const params = new HttpParams()
      .set('almacenId', almacenId)
      .set('productoId', productoId)
      .set('page', pagina)
      .set('size', tamano)
      .set('sort', 'fecha,desc');
    return this.http.get<PaginaRespuesta<KardexResponse>>(`${environment.apiUrl}/kardex`, { params });
  }

  /**
   * Solo almacenId -- el backend ignora productoId si ambos vienen juntos
   * (mira primero almacenId), así que se pide el stock del almacén completo
   * y el componente filtra la fila del producto que le interesa.
   */
  consultarStockDeAlmacen(almacenId: number): Observable<AlmacenStockResponse[]> {
    const params = new HttpParams().set('almacenId', almacenId);
    return this.http.get<AlmacenStockResponse[]>(`${environment.apiUrl}/stock`, { params });
  }

  /** Todos los almacenes a la vez -- el filtro por stockMinimo lo hace el backend, no manda almacenId ni productoId. */
  bajoElMinimo(): Observable<AlmacenStockResponse[]> {
    return this.http.get<AlmacenStockResponse[]>(`${environment.apiUrl}/stock/bajo-minimo`);
  }
}
