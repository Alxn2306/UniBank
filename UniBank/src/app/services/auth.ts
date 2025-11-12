// auth.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  getUser() {
    if (!this.isBrowser) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  getCurrentUserRole(): string | null {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  verifyToken(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  isValidUser(): boolean {
    if (!this.isAuthenticated()) return false;
    const userRole = this.getCurrentUserRole();
    const validRoles = ['cliente', 'ejecutivo', 'manager'];
    return validRoles.includes(userRole || '');
  }

  redirectToHomePage(router: any): void {
    const userRole = this.getCurrentUserRole();
    switch (userRole?.toLowerCase()) {
      case 'cliente': router.navigate(['/cliente-layout/micuenta']); break;
      case 'ejecutivo': router.navigate(['/ejecutivo-layout/datoscliente']); break;
      case 'manager': router.navigate(['/gerente-layout/clientes']); break;
      default: router.navigate(['']);
    }
  }
}
