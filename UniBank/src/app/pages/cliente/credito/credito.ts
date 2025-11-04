import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Elegibilidad {
  elegible: boolean;
  saldo: number;
  movimientos: number;
  credito_disponible: number;
}

@Component({
  selector: 'app-credito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credito.html',
  styleUrl: './credito.css'
})
export class Credito implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:3000/api';
  
  montoSolicitud: number = 0;
  identificacion: string = '';
  mensajeSolicitud: string = '';
  errorSolicitud: string = '';
  
  elegibilidad: Elegibilidad | null = null;
  montoOferta: number = 10000;
  cargando: boolean = true;
  mensajeOferta: string = '';
  private intervalo: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {

    setTimeout(() => {
      this.verificarElegibilidad();
    }, 100);
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  verificarElegibilidad() {
    this.cargando = true;
    
    this.http.get<any>(`${this.apiUrl}/credito/elegibilidad`, { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (response) => {

        Promise.resolve().then(() => {
          this.elegibilidad = response;
          this.cargando = false;
          console.log('Elegibilidad:', this.elegibilidad);
          console.log('Cargando:', this.cargando);
        });
      },
      error: (error) => {
        Promise.resolve().then(() => {
          console.error('Error:', error);
          this.cargando = false;
        });
      }
    });
  }

  solicitarCredito() {
    if (!this.montoSolicitud || this.montoSolicitud <= 0) {
      this.errorSolicitud = 'Ingresa un monto válido';
      return;
    }

    if (!this.identificacion || this.identificacion.trim() === '') {
      this.errorSolicitud = 'Ingresa tu identificación';
      return;
    }

    this.errorSolicitud = '';
    this.mensajeSolicitud = '';
    this.cargando = true;

    const datos = {
      monto: this.montoSolicitud,
      identificacion: this.identificacion
    };

    this.http.post<any>(`${this.apiUrl}/credito/solicitar`, datos, { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (response) => {
        Promise.resolve().then(() => {
          this.mensajeSolicitud = response.mensaje;
          this.montoSolicitud = 0;
          this.identificacion = '';
          this.cargando = false;
        });
      },
      error: (error) => {
        Promise.resolve().then(() => {
          this.errorSolicitud = error.error?.mensaje || 'Error al solicitar crédito';
          this.cargando = false;
        });
      }
    });
  }

  aceptarOferta() {
    if (!this.elegibilidad?.elegible) return;

    this.cargando = true;
    this.mensajeOferta = '';

    const datos = { monto: this.montoOferta };

    this.http.post<any>(`${this.apiUrl}/credito/aceptar-oferta`, datos, { 
      headers: this.getHeaders() 
    }).subscribe({
      next: (response) => {
        Promise.resolve().then(() => {
          this.mensajeOferta = response.mensaje;
          this.cargando = false;
        });
        setTimeout(() => this.verificarElegibilidad(), 2000);
      },
      error: (error) => {
        Promise.resolve().then(() => {
          this.mensajeOferta = error.error?.mensaje || 'Error al aceptar la oferta';
          this.cargando = false;
        });
      }
    });
  }
}