import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { mensajeError } from '../../core/http/error-message';
import { ProveedorService } from './proveedor.service';
import { ProveedorRequest } from './proveedor.models';

@Component({
  selector: 'app-proveedor-form',
  imports: [ReactiveFormsModule, RouterLink, NzAlertModule, NzButtonModule, NzFormModule, NzInputModule],
  templateUrl: './proveedor-form.html',
  styleUrl: './proveedor-form.scss',
})
export class ProveedorForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly proveedorService = inject(ProveedorService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly proveedorId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    ruc: ['', Validators.required],
    razonSocial: ['', Validators.required],
    telefono: ['', Validators.maxLength(15)],
    telefonoAlternativo: ['', Validators.maxLength(15)],
    cuentaBancaria: ['', Validators.maxLength(30)],
    nombreContacto: [''],
    email: ['', Validators.email],
    rubro: [''],
    direccionLinea: ['', Validators.required],
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
    this.proveedorId.set(Number(id));
    this.proveedorService.obtener(Number(id)).subscribe((proveedor) => {
      this.formulario.patchValue({
        ruc: proveedor.ruc,
        razonSocial: proveedor.razonSocial,
        telefono: proveedor.telefono ?? '',
        telefonoAlternativo: proveedor.telefonoAlternativo ?? '',
        cuentaBancaria: proveedor.cuentaBancaria ?? '',
        nombreContacto: proveedor.nombreContacto ?? '',
        email: proveedor.email ?? '',
        rubro: proveedor.rubro ?? '',
        direccionLinea: proveedor.direccion.direccionLinea,
        pais: proveedor.direccion.pais ?? '',
        departamento: proveedor.direccion.departamento ?? '',
        provincia: proveedor.direccion.provincia ?? '',
        distrito: proveedor.direccion.distrito ?? '',
        referencia: proveedor.direccion.referencia ?? '',
      });
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const valores = this.formulario.getRawValue();
    const payload: ProveedorRequest = {
      ruc: valores.ruc,
      razonSocial: valores.razonSocial,
      telefono: valores.telefono.trim() || null,
      telefonoAlternativo: valores.telefonoAlternativo.trim() || null,
      cuentaBancaria: valores.cuentaBancaria.trim() || null,
      nombreContacto: valores.nombreContacto.trim() || null,
      email: valores.email.trim() || null,
      rubro: valores.rubro.trim() || null,
      direccion: {
        direccionLinea: valores.direccionLinea,
        pais: valores.pais.trim() || null,
        departamento: valores.departamento.trim() || null,
        provincia: valores.provincia.trim() || null,
        distrito: valores.distrito.trim() || null,
        referencia: valores.referencia.trim() || null,
      },
    };

    const id = this.proveedorId();
    const peticion = id ? this.proveedorService.actualizar(id, payload) : this.proveedorService.crear(payload);
    peticion.subscribe({
      next: () => this.router.navigateByUrl('/proveedores'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el proveedor -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }
}
