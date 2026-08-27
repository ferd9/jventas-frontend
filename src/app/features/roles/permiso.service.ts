import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermisoResponse } from './rol.models';

/** Solo lectura -- alimenta los checkboxes del formulario de rol, ver PermisoController en el backend. */
@Injectable({ providedIn: 'root' })
export class PermisoService {
  private readonly base = `${environment.apiUrl}/permisos`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<PermisoResponse[]> {
    return this.http.get<PermisoResponse[]>(this.base);
  }
}
