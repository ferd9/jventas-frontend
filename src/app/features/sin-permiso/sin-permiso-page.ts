import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-permiso-page',
  imports: [NzResultModule, NzButtonModule, RouterLink],
  template: `
    <nz-result nzStatus="403" nzTitle="Sin permiso" nzSubTitle="Tu usuario no tiene acceso a esta sección.">
      <div nz-result-extra>
        <button nz-button nzType="primary" routerLink="/">Volver al inicio</button>
      </div>
    </nz-result>
  `,
})
export class SinPermisoPage {}
