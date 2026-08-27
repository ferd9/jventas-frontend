import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { AuthService } from '../core/auth/auth.service';
import { mensajeError } from '../core/http/error-message';

/** Layout de todas las pantallas autenticadas -- sidebar + header + <router-outlet /> del contenido. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzDropDownModule,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly fb = inject(FormBuilder);

  protected colapsado = false;

  protected readonly passwordModalVisible = signal(false);
  protected readonly guardandoPassword = signal(false);
  protected readonly errorPassword = signal<string | null>(null);

  protected readonly formularioPassword = this.fb.nonNullable.group({
    passwordActual: ['', Validators.required],
    passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', Validators.required],
  });

  constructor(protected readonly authService: AuthService) {}

  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }

  abrirCambiarPassword(): void {
    this.errorPassword.set(null);
    this.formularioPassword.reset({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
    this.passwordModalVisible.set(true);
  }

  cancelarCambiarPassword(): void {
    this.passwordModalVisible.set(false);
  }

  guardarPassword(): void {
    if (this.formularioPassword.invalid) {
      this.formularioPassword.markAllAsTouched();
      return;
    }

    const valores = this.formularioPassword.getRawValue();
    if (valores.passwordNueva !== valores.confirmarPassword) {
      this.errorPassword.set('La confirmación no coincide con la contraseña nueva');
      return;
    }

    this.guardandoPassword.set(true);
    this.errorPassword.set(null);

    this.authService.cambiarPassword({ passwordActual: valores.passwordActual, passwordNueva: valores.passwordNueva }).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.passwordModalVisible.set(false);
      },
      error: (err) => {
        this.errorPassword.set(mensajeError(err, 'No se pudo cambiar la contraseña'));
        this.guardandoPassword.set(false);
      },
    });
  }
}
