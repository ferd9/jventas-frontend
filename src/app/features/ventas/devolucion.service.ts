import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DevolucionRequest, DevolucionResponse } from './devolucion.models';

/** Documento propio, no un PUT sobre la venta -- ver decisión de negocio en el backend (DevolucionService). */
@Injectable({ providedIn: 'root' })
export class DevolucionService {
  constructor(private readonly http: HttpClient) {}

  private base(ventaId: number): string {
    return `${environment.apiUrl}/ventas/${ventaId}/devoluciones`;
  }

  listar(ventaId: number): Observable<DevolucionResponse[]> {
    return this.http.get<DevolucionResponse[]>(this.base(ventaId));
  }

  registrar(ventaId: number, request: DevolucionRequest): Observable<DevolucionResponse> {
    return this.http.post<DevolucionResponse>(this.base(ventaId), request);
  }
}
