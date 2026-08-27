import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoRequest, PagoResponse, SaldoResponse } from './pago.models';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly base = `${environment.apiUrl}/pagos`;

  constructor(private readonly http: HttpClient) {}

  listarPorVenta(ventaId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(this.base, { params: new HttpParams().set('ventaId', ventaId) });
  }

  listarPorCompra(compraId: number): Observable<PagoResponse[]> {
    return this.http.get<PagoResponse[]>(this.base, { params: new HttpParams().set('compraId', compraId) });
  }

  saldoDeVenta(ventaId: number): Observable<SaldoResponse> {
    return this.http.get<SaldoResponse>(`${this.base}/saldo`, { params: new HttpParams().set('ventaId', ventaId) });
  }

  saldoDeCompra(compraId: number): Observable<SaldoResponse> {
    return this.http.get<SaldoResponse>(`${this.base}/saldo`, { params: new HttpParams().set('compraId', compraId) });
  }

  registrar(request: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(this.base, request);
  }
}
