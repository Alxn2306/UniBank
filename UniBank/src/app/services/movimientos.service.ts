import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {
  private apiUrl = 'http://localhost:3000/api/movimientos';

  constructor(private http: HttpClient) {}

obtenerMovimientos(): Observable<any> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('NO HAY TOKEN');
    throw new Error('No hay token de autenticación');
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  console.log('Llamando a:', this.apiUrl);
  
  return this.http.get(this.apiUrl, { headers }).pipe(
    tap({
      next: (response: any) => {
        console.log('Respuesta:', response);
        console.log('Movimientos recibidos:', response.movimientos?.length || 0);
      },
      error: (error) => {
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Mensaje:', error.error);
      }
    })
  );
}
}