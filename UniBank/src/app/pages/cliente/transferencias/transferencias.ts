import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-transferencias',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './transferencias.html',
  styleUrls: ['./transferencias.css']
})
export class Transferencias {
  destinatario_id: number = 0;
  monto: number = 0;
  mensaje: string = '';

  constructor(private http: HttpClient, private auth: AuthService) {}

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
        // 🟢 Alerta de confirmación
        alert(`✅ Transferencia realizada correctamente\nMonto: $${this.monto}\n${res.mensaje}`);
        // Limpiar campos después del envío
        this.destinatario_id = 0;
        this.monto = 0;
      },
      error: (err) => {
        this.mensaje = err.error?.mensaje || 'Error en la transferencia';
        alert(`❌ ${this.mensaje}`);
      }
    });
  }
}
