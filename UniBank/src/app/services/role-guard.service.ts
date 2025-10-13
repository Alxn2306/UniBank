//role-guard-servise
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: any): boolean {
    try {
      if (!this.authService.isAuthenticated()) {
        console.warn('Usuario no autenticado, redirigiendo al inicio');
        this.router.navigate(['']);
        return false;
      }

      const expectedRole = route.data?.['expectedRole'];
      
      if (!expectedRole) {
        console.error('Rol esperado no definido en la ruta:', route);
        this.redirectToDefault();
        return false;
      }

      const userRole = this.authService.getCurrentUserRole();
      
      if (!userRole) {
        console.warn('Usuario sin rol definido');
        this.redirectToDefault();
        return false;
      }


      if (userRole === expectedRole) {
        return true;
      }

      console.warn(`Usuario con rol '${userRole}' intentó acceder a ruta que requiere '${expectedRole}'`);
      this.redirectByRole(userRole);
      return false;

    } catch (error) {
      console.error('Error en RoleGuard:', error);
      this.redirectToDefault();
      return false;
    }
  }

  private redirectByRole(rol: string) {
    switch(rol.toLowerCase()) {
      case 'cliente':
        this.router.navigate(['/cliente-layout/micuenta']);
        break;
      case 'ejecutivo':
        this.router.navigate(['/ejecutivo-layout/datoscliente']);
        break;
      case 'manager':
        this.router.navigate(['/gerente-layout/clientes']);
        break;
      default:
        this.redirectToDefault();
    }
  }

  private redirectToDefault(): void {
    this.router.navigate(['']);
  }
}