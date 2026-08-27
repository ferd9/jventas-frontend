import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { mensajeError } from '../../core/http/error-message';
import { ClienteService } from './cliente.service';
import { ClienteRequest, SEXOS, TIPOS_CLIENTE } from './cliente.models';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink, NzAlertModule, NzButtonModule, NzFormModule, NzInputModule, NzSelectModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteForm implements OnInit {
  // inject() a propósito: los inicializadores de campo corren antes de que las
  // parameter properties del constructor se asignen, ver producto-form.ts
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly tiposCliente = TIPOS_CLIENTE;
  protected readonly sexos = SEXOS;

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly clienteId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    tipo: ['NATURAL' as 'NATURAL' | 'JURIDICA', Validators.required],
    ruc: [''],
    dni: [''],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    sexo: [null as 'H' | 'M' | null],
    email: ['', Validators.email],
    telefono: ['', Validators.maxLength(15)],
    celular: ['', Validators.maxLength(15)],
    direccionLinea: [''],
    pais: [''],
    departamento: [''],
    provincia: [''],
    distrito: [''],
    referencia: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.clienteId.set(Number(id));
    this.clienteService.obtener(Number(id)).subscribe((cliente) => {
      this.formulario.patchValue({
        tipo: cliente.tipo,
        ruc: cliente.ruc ?? '',
        dni: cliente.dni ?? '',
        nombre: cliente.nombre,
        apellidos: cliente.apellidos,
        sexo: cliente.sexo,
        email: cliente.email ?? '',
        telefono: cliente.telefono ?? '',
        celular: cliente.celular ?? '',
        direccionLinea: cliente.direccion?.direccionLinea ?? '',
        pais: cliente.direccion?.pais ?? '',
        departamento: cliente.direccion?.departamento ?? '',
        provincia: cliente.direccion?.provincia ?? '',
        distrito: cliente.direccion?.distrito ?? '',
        referencia: cliente.direccion?.referencia ?? '',
      });
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();
    if (!valores.ruc.trim() && !valores.dni.trim()) {
      this.error.set('Ingresa RUC o DNI -- el cliente necesita al menos uno de los dos');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const payload: ClienteRequest = {
      tipo: valores.tipo,
      ruc: valores.ruc.trim() || null,
      dni: valores.dni.trim() || null,
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      sexo: valores.sexo,
      email: valores.email.trim() || null,
      telefono: valores.telefono.trim() || null,
      celular: valores.celular.trim() || null,
      // sin dirección de línea no mandamos objeto -- DireccionRequest exige direccionLinea si se manda
      direccion: valores.direccionLinea.trim()
        ? {
            direccionLinea: valores.direccionLinea.trim(),
            pais: valores.pais.trim() || null,
            departamento: valores.departamento.trim() || null,
            provincia: valores.provincia.trim() || null,
            distrito: valores.distrito.trim() || null,
            referencia: valores.referencia.trim() || null,
          }
        : null,
    };

    const id = this.clienteId();
    const peticion = id ? this.clienteService.actualizar(id, payload) : this.clienteService.crear(payload);
    peticion.subscribe({
      next: () => this.router.navigateByUrl('/clientes'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el cliente -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }
}
