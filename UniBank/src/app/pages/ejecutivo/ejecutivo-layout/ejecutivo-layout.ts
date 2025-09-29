import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-ejecutivo-layout', // ¡Corregí el selector!
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Agrega los imports necesarios
  templateUrl: './ejecutivo-layout.html',
  styleUrls: ['./ejecutivo-layout.css']
})
export class EjecutivoLayout {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}