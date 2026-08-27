import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CuentaPorCobrarResponse, CuentaPorPagarResponse } from './reporte.models';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly base = `${environment.apiUrl}/reportes`;

  constructor(private readonly http: HttpClient) {}

  cuentasPorCobrar(): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.base}/cuentas-por-cobrar`);
  }

  cuentasPorPagar(): Observable<CuentaPorPagarResponse[]> {
    return this.http.get<CuentaPorPagarResponse[]>(`${this.base}/cuentas-por-pagar`);
  }
}
