import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

interface Credito {
  id: number;
  tipo: string;
  monto: number;
  estado: string;
  fecha: string;
}

@Component({
  selector: 'app-micuenta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './micuenta.html',
  styleUrls: ['./micuenta.css']
})
export class Micuenta implements OnInit, OnDestroy {
  usuario: any;
  credito: Credito | null = null;
  tieneCredito: boolean = false;
  cargandoCredito: boolean = true;
  private intervalo: any;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    setTimeout(() => this.cargarDatos(), 0);
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  cargarDatos() {
    this.recargarPerfil();
    this.obtenerCredito();
  }

  recargarPerfil() {
    const token = this.auth.getToken();
    
    if (!token) {
      return;
    }

    this.http.get('http://localhost:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this.usuario = res.usuario;
        }, 0);
      },
      error: (err) => console.error('Error:', err)
    });
  }

  obtenerCredito() {
    this.cargandoCredito = true;
    const token = this.auth.getToken();
    
    if (!token) {
      this.cargandoCredito = false;
      return;
    }
    
    this.http.get<any>('http://localhost:3000/api/credito/mi-credito', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.tieneCredito = res.tieneCredito;
          this.credito = res.credito;
          this.cargandoCredito = false;
        }, 0);
      },
      error: (err) => {
        console.error('Error:', err);
        setTimeout(() => {
          this.cargandoCredito = false;
        }, 0);
      }
    });
  }

  actualizarTodo() {
    this.cargandoCredito = true;
    this.cargarDatos();
  }
}