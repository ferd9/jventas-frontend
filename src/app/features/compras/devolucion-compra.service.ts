import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DevolucionCompraRequest, DevolucionCompraResponse } from './devolucion-compra.models';

/** Documento propio, no un PUT sobre la compra -- ver decisión de negocio en el backend (DevolucionCompraService). */
@Injectable({ providedIn: 'root' })
export class DevolucionCompraService {
  constructor(private readonly http: HttpClient) {}

  private base(compraId: number): string {
    return `${environment.apiUrl}/compras/${compraId}/devoluciones`;
  }

  listar(compraId: number): Observable<DevolucionCompraResponse[]> {
    return this.http.get<DevolucionCompraResponse[]>(this.base(compraId));
  }

  registrar(compraId: number, request: DevolucionCompraRequest): Observable<DevolucionCompraResponse> {
    return this.http.post<DevolucionCompraResponse>(this.base(compraId), request);
  }
}
