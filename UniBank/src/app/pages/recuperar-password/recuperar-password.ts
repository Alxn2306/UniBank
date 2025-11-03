import { Component, ChangeDetectorRef } from '@angular/core'; // ← Agrega ChangeDetectorRef
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrls: ['./recuperar-password.css']
})
export class RecuperarPassword {
  paso: number = 1;
  
  correo: string = '';
  codigo: string = '';
  nuevaContrasena: string = '';
  
  loading: boolean = false;
  mensaje: string = '';
  error: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef // ← AÑADE ESTO
  ) {}

  solicitarCodigo() {
  console.log('🔵 Paso actual ANTES:', this.paso);
  
  if (!this.correo) {
    this.mostrarError('Por favor ingresa tu correo');
    return;
  }

  this.loading = true;
  console.log('🔵 Loading TRUE');
  
  this.http.post('http://localhost:3000/api/auth/solicitar-codigo', { correo: this.correo })
    .subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta completa:', response);
        console.log('✅ response.success:', response.success);
        
        if (response.success) {
          console.log('🟢 Entrando al IF de success');
          this.paso = 2;
          console.log('🔵 Paso cambiado a:', this.paso);
          this.cdr.detectChanges();
          console.log('🔵 detectChanges ejecutado');
          this.mostrarExito(response.mensaje);
        } else {
          console.log('🔴 Success es false');
          this.mostrarError(response.mensaje);
        }
        
        this.loading = false;
        console.log('🔵 Loading FALSE:', this.loading);
      },
      error: (err) => {
        console.error('❌ Error completo:', err);
        this.mostrarError(err.error?.mensaje || 'Error al enviar el código');
        this.loading = false;
      }
    });
}

  cambiarPassword() {
    if (!this.codigo || !this.nuevaContrasena) {
      this.mostrarError('Por favor completa todos los campos');
      return;
    }

    if (this.nuevaContrasena.length < 6) {
      this.mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:3000/api/auth/cambiar-password', {
      correo: this.correo,
      codigo: this.codigo,
      nuevaContrasena: this.nuevaContrasena
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.mostrarExito(response.mensaje);
          setTimeout(() => {
            this.router.navigate(['/logincliente']);
          }, 2000);
        } else {
          this.mostrarError(response.mensaje);
        }
        this.loading = false;
      },
      error: (err) => {
        this.mostrarError(err.error?.mensaje || 'Error al cambiar la contraseña');
        this.loading = false;
      }
    });
  }

  mostrarError(msg: string) {
    this.mensaje = msg;
    this.error = true;
  }

  mostrarExito(msg: string) {
    this.mensaje = msg;
    this.error = false;
  }
}