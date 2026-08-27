import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { mensajeError } from '../../core/http/error-message';
import { AlmacenService } from './almacen.service';
import { SerieDocumentoService } from './serie-documento.service';
import { TipoDocumentoService } from './tipo-documento.service';
import { AlmacenResponse, SerieDocumentoRequest, SerieDocumentoResponse, TipoDocumentoResponse } from './catalogos.models';

/**
 * El backend exige almacenId + tipoDocumentoId para listar series -- no existe un
 * "ver todas". Por eso esta página empieza pidiendo esos dos filtros antes de
 * mostrar (o dejar crear) ninguna serie.
 */
@Component({
  selector: 'app-series-documento-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './series-documento-page.html',
  styleUrl: './series-documento-page.scss',
})
export class SeriesDocumentoPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly almacenService = inject(AlmacenService);
  private readonly tipoDocumentoService = inject(TipoDocumentoService);
  private readonly serieDocumentoService = inject(SerieDocumentoService);

  protected readonly almacenes = signal<AlmacenResponse[]>([]);
  protected readonly tiposDocumento = signal<TipoDocumentoResponse[]>([]);
  protected readonly series = signal<SerieDocumentoResponse[]>([]);
  protected readonly cargando = signal(false);
  protected readonly errorFiltro = signal<string | null>(null);

  protected readonly filtroAlmacenId = signal<number | null>(null);
  protected readonly filtroTipoDocumentoId = signal<number | null>(null);

  protected readonly modalVisible = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    serie: ['', [Validators.required, Validators.maxLength(10)]],
  });

  ngOnInit(): void {
    this.almacenService.listar().subscribe((r) => this.almacenes.set(r));
    this.tipoDocumentoService.listar().subscribe((r) => this.tiposDocumento.set(r));
  }

  cambiarFiltroAlmacen(almacenId: number | null): void {
    this.filtroAlmacenId.set(almacenId);
    this.cargarSiHayFiltrosCompletos();
  }

  cambiarFiltroTipoDocumento(tipoDocumentoId: number | null): void {
    this.filtroTipoDocumentoId.set(tipoDocumentoId);
    this.cargarSiHayFiltrosCompletos();
  }

  abrirCrear(): void {
    this.error.set(null);
    this.formulario.reset({ serie: '' });
    this.modalVisible.set(true);
  }

  cancelar(): void {
    this.modalVisible.set(false);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const almacenId = this.filtroAlmacenId();
    const tipoDocumentoId = this.filtroTipoDocumentoId();
    if (!almacenId || !tipoDocumentoId) {
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: SerieDocumentoRequest = { almacenId, tipoDocumentoId, serie: this.formulario.getRawValue().serie };
    this.serieDocumentoService.crear(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargarSiHayFiltrosCompletos();
      },
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo crear la serie'));
        this.guardando.set(false);
      },
    });
  }

  private cargarSiHayFiltrosCompletos(): void {
    const almacenId = this.filtroAlmacenId();
    const tipoDocumentoId = this.filtroTipoDocumentoId();
    this.errorFiltro.set(null);
    if (!almacenId || !tipoDocumentoId) {
      this.series.set([]);
      return;
    }

    this.cargando.set(true);
    this.serieDocumentoService.listar(almacenId, tipoDocumentoId).subscribe({
      next: (series) => {
        this.series.set(series);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorFiltro.set(mensajeError(err, 'No se pudieron cargar las series'));
        this.cargando.set(false);
      },
    });
  }
}
