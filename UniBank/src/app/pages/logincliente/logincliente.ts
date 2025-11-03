import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // ← Agrega RouterLink
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // ← Agrega RouterLink aquí
  templateUrl: './logincliente.html',
  styleUrls: ['./logincliente.css']
})
export class Logincliente {
  
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

        if (response.success) {
          // 🟢 Guardar el token y usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.usuario));

          console.log('Usuario logueado:', response.usuario);

          // 🟢 Redirigir según el rol
          this.redirectByRole(response.usuario.rol);
        } else {
          this.errorMessage = response.mensaje || 'Credenciales incorrectas';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error de login:', error);
        this.errorMessage = error.error?.mensaje || 'Error al iniciar sesión';
      }
    });
  }

  private redirectByRole(rol: string) {
    switch(rol.toLowerCase()) {
      case 'cliente':
        // 🟢 Redirigir directamente al historial de movimientos
        this.router.navigate(['/cliente-layout/micuenta']);
        break;
      case 'ejecutivo':
        this.router.navigate(['/ejecutivo-layout/datoscliente']);
        break;
      case 'manager':
        this.router.navigate(['/gerente-layout/clientes']);
        break;
      default:
        this.router.navigate(['/cliente-layout/micuenta']);
    }
  }
}
