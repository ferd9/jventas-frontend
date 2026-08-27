import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { MonedaService } from './moneda.service';
import { MonedaResponse } from './catalogos.models';

/** Solo lectura: el backend no expone crear/editar moneda (ver MonedaController). */
@Component({
  selector: 'app-monedas-page',
  imports: [NzTableModule, NzTagModule],
  templateUrl: './monedas-page.html',
  styleUrl: './monedas-page.scss',
})
export class MonedasPage implements OnInit {
  private readonly monedaService = inject(MonedaService);

  protected readonly monedas = signal<MonedaResponse[]>([]);
  protected readonly cargando = signal(false);

  ngOnInit(): void {
    this.cargando.set(true);
    this.monedaService.listar().subscribe({
      next: (monedas) => {
        this.monedas.set(monedas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
