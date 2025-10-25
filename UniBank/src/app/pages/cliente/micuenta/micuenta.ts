import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-micuenta',
  standalone: true,
  templateUrl: './micuenta.html',
  styleUrls: ['./micuenta.css']
})
export class Micuenta implements OnInit {
  usuario: any;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.recargarPerfil();
  }

  recargarPerfil() {
    const token = this.auth.getToken();
    this.http.get('http://localhost:3000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => this.usuario = res.usuario,
      error: (err) => console.error('Error obteniendo perfil:', err)
    });
  }
}
