import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';
import { RetiroService } from '../../../services/retiro.service';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './transferencias.html',
  styleUrls: ['./transferencias.css']
})
export class Transferencias {
  tabActiva: 'transferencia' | 'retiro' = 'transferencia';
  destinatario_id: number = 0;
  monto: number = 0;
  mensaje: string = '';
  montoRetiro: number = 0;
  cargandoRetiro: boolean = false;
  codigoRetiro: string = '';
  mostrarCodigo: boolean = false;
  comisionRetiro: number = 0;
  totalRetiro: number = 0;
  cancelandoRetiro: boolean = false;  // ← NUEVO

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private retiroService: RetiroService,
    private cdr: ChangeDetectorRef
  ) {}

  cambiarTab(tab: 'transferencia' | 'retiro'): void {
    this.tabActiva = tab;
    this.limpiarFormularios();
  }

  limpiarFormularios(): void {
    this.destinatario_id = 0;
    this.monto = 0;
    this.mensaje = '';
    this.montoRetiro = 0;
    this.codigoRetiro = '';
    this.mostrarCodigo = false;
    this.comisionRetiro = 0;
    this.totalRetiro = 0;
    this.cancelandoRetiro = false;
  }

  realizarTransferencia() {
    const token = this.auth.getToken();
    if (!this.destinatario_id || !this.monto || this.monto <= 0) {
      alert('Por favor ingresa un ID válido y un monto mayor a 0');
      return;
    }

    this.http.post('http://localhost:3000/api/transferencia', {
      destinatario_id: this.destinatario_id,
      monto: this.monto
    }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje;
        alert(`Transferencia realizada correctamente\nMonto: $${this.monto}\n${res.mensaje}`);
        this.destinatario_id = 0;
        this.monto = 0;
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error en la transferencia';
        alert(`${this.mensaje}`);
      }
    });
  }

  generarRetiro(): void {
    if (this.montoRetiro <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    this.cargandoRetiro = true;
    this.retiroService.generarRetiro(this.montoRetiro).subscribe({
      next: (response) => {
        if (response.success) {
          this.codigoRetiro = response.codigo;
          this.comisionRetiro = response.comision;
          this.totalRetiro = response.total;
          this.mostrarCodigo = true;
          this.cdr.detectChanges();
        } else {
          alert(response.mensaje || 'Error al generar el retiro');
        }
        this.cargandoRetiro = false;
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al conectar con el servidor');
        this.cargandoRetiro = false;
      }
    });
  }

  // ← NUEVO MÉTODO
  cancelarRetiro(): void {
    if (!confirm('¿Estás seguro de cancelar este retiro? El dinero será devuelto a tu cuenta.')) {
      return;
    }

    this.cancelandoRetiro = true;
    this.retiroService.cancelarRetiro(this.codigoRetiro).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`${response.mensaje}`);
          this.cerrarModalCodigo();
        } else {
          alert(response.mensaje || 'Error al cancelar el retiro');
        }
        this.cancelandoRetiro = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.mensaje || 'Error al cancelar el retiro');
        this.cancelandoRetiro = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalCodigo(): void {
    this.mostrarCodigo = false;
    this.montoRetiro = 0;
    this.codigoRetiro = '';
    this.cdr.detectChanges();
  }
}