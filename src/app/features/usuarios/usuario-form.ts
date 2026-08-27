import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { mensajeError } from '../../core/http/error-message';
import { CargoService } from '../catalogos/cargo.service';
import { CargoResponse } from '../catalogos/catalogos.models';
import { RolService } from '../roles/rol.service';
import { RolResponse } from '../roles/rol.models';
import { UsuarioService } from './usuario.service';
import { SEXOS, UsuarioActualizarRequest, UsuarioCrearRequest } from './usuario.models';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink, NzAlertModule, NzButtonModule, NzFormModule, NzInputModule, NzSelectModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
})
export class UsuarioForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly cargoService = inject(CargoService);
  private readonly rolService = inject(RolService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly sexos = SEXOS;
  protected readonly cargos = signal<CargoResponse[]>([]);
  protected readonly roles = signal<RolResponse[]>([]);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly usuarioId = signal<number | null>(null);

  protected readonly formulario = this.fb.nonNullable.group({
    dni: ['', Validators.required],
    codigo: ['', Validators.required],
    login: ['', Validators.required],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    password: [''],
    fechaNacimiento: [''],
    telefono: ['', [Validators.required, Validators.maxLength(15)]],
    telefono2: ['', Validators.maxLength(15)],
    celular: ['', Validators.maxLength(15)],
    email: ['', Validators.email],
    sexo: [null as 'H' | 'M' | null, Validators.required],
    cargoId: [null as number | null, Validators.required],
    descripcion: [''],
    rolIds: [[] as number[]],
  });

  ngOnInit(): void {
    this.cargoService.listar().subscribe((r) => this.cargos.set(r));

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.formulario.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
      this.rolService.listar().subscribe((r) => this.roles.set(r));
      return;
    }

    this.usuarioId.set(Number(id));
    this.rolService.listar().subscribe((roles) => {
      this.roles.set(roles);
      this.usuarioService.obtener(Number(id)).subscribe((usuario) => {
        const rolIds = roles.filter((r) => usuario.roles.includes(r.nombre)).map((r) => r.id);
        this.formulario.patchValue({
          dni: usuario.dni,
          codigo: usuario.codigo,
          login: usuario.login,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          fechaNacimiento: usuario.fechaNacimiento ?? '',
          telefono: usuario.telefono ?? '',
          telefono2: usuario.telefono2 ?? '',
          celular: usuario.celular ?? '',
          email: usuario.email ?? '',
          sexo: usuario.sexo,
          cargoId: usuario.cargoId,
          descripcion: usuario.descripcion ?? '',
          rolIds,
        });
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
    const id = this.usuarioId();

    const peticion = id
      ? this.usuarioService.actualizar(id, this.aActualizarRequest(valores))
      : this.usuarioService.crear(this.aCrearRequest(valores));

    peticion.subscribe({
      next: () => this.router.navigateByUrl('/usuarios'),
      error: (err) => {
        this.error.set(mensajeError(err, 'No se pudo guardar el usuario -- revisa los datos e intenta de nuevo'));
        this.guardando.set(false);
      },
    });
  }

  private aCrearRequest(valores: ReturnType<typeof this.formulario.getRawValue>): UsuarioCrearRequest {
    return {
      dni: valores.dni,
      codigo: valores.codigo,
      login: valores.login,
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      password: valores.password,
      fechaNacimiento: valores.fechaNacimiento || null,
      telefono: valores.telefono,
      telefono2: valores.telefono2.trim() || null,
      celular: valores.celular.trim() || null,
      email: valores.email.trim() || null,
      sexo: valores.sexo!,
      cargoId: valores.cargoId!,
      descripcion: valores.descripcion.trim() || null,
      rolIds: valores.rolIds,
    };
  }

  private aActualizarRequest(valores: ReturnType<typeof this.formulario.getRawValue>): UsuarioActualizarRequest {
    return {
      dni: valores.dni,
      codigo: valores.codigo,
      login: valores.login,
      nombre: valores.nombre,
      apellidos: valores.apellidos,
      fechaNacimiento: valores.fechaNacimiento || null,
      telefono: valores.telefono,
      telefono2: valores.telefono2.trim() || null,
      celular: valores.celular.trim() || null,
      email: valores.email.trim() || null,
      sexo: valores.sexo!,
      cargoId: valores.cargoId!,
      descripcion: valores.descripcion.trim() || null,
      rolIds: valores.rolIds,
    };
  }
}
