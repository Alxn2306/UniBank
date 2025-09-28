// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  success: boolean;
  mensaje: string;
  token: string;
  usuario: {
    id: number;
    nombre_usuario: string;
    correo: string;
    rol: string;
  };
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // === MÉTODOS NUEVOS PARA LOS GUARDS ===

  /**
   * Obtiene el rol del usuario actualmente autenticado
   */
  getCurrentUserRole(): string | null {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: string): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  /**
   * Verifica el token con el backend para mayor seguridad
   */
  verifyToken(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      // Retornar un observable con error si no hay token
      return new Observable(observer => {
        observer.error('No hay token disponible');
      });
    }

    return this.http.get(`${this.apiUrl}/auth/verify`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
  }

  /**
   * Verifica si el usuario está autenticado y tiene un rol válido
   */
  isValidUser(): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    const userRole = this.getCurrentUserRole();
    const validRoles = ['cliente', 'ejecutivo', 'manager'];
    
    return validRoles.includes(userRole || '');
  }

  /**
   * Redirige al usuario a su página principal según su rol
   */
  redirectToHomePage(router: any): void {
    const userRole = this.getCurrentUserRole();
    
    switch(userRole?.toLowerCase()) {
      case 'cliente':
        router.navigate(['/cliente-layout/micuenta']);
        break;
      case 'ejecutivo':
        router.navigate(['/ejecutivo-layout/datoscliente']);
        break;
      case 'manager':
        router.navigate(['/manager']);
        break;
      default:
        router.navigate(['/']);
    }
  }
}