// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loginmanager.html',
  styleUrls: ['./loginmanager.css']
})
export class Loginmanager {
  
  loginData = {
    correo: '',
    contrasena: ''
  };
  
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.loginData.correo || !this.loginData.contrasena) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading = false;
        // Guardar el token y datos del usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.usuario));
        
        // Redirigir según el rol
        this.redirectByRole(response.usuario.rol);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }

  private redirectByRole(rol: string) {
    switch(rol.toLowerCase()) {
      case 'cliente':
        this.router.navigate(['/cliente-layout/micuenta']);
        break;
      case 'ejecutivo':
        this.router.navigate(['/ejecutivo-layout/dashboard']);
        break;
      case 'manager':
        this.router.navigate(['/manager-layout/dashboard']);
        break;
      default:
        this.router.navigate(['/cliente-layout/micuenta']);
    }
  }
}