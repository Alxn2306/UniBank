import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  nombre_usuario = '';
  telefono = '';
  correo = '';
  contrasena = '';
  rol_id = 1; // valor por defecto
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  registrarUsuario() {
    if (!this.nombre_usuario || !this.correo || !this.contrasena) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const nuevoUsuario = {
      nombre_usuario: this.nombre_usuario,
      telefono: this.telefono,
      correo: this.correo,
      contrasena: this.contrasena,
      rol_id: this.rol_id
    };

    this.loading = true;
    this.authService.register(nuevoUsuario).subscribe({
      next: (res) => {
        this.loading = false;
        alert(res.mensaje || 'Registro exitoso');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert(err.error?.mensaje || 'Error al registrar usuario');
      }
    });
  }
}

