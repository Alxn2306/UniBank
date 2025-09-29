import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-gerente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Agrega RouterLink y RouterLinkActive
  templateUrl: './gerente-layout.html',
  styleUrls: ['./gerente-layout.css']
})
export class GerenteLayout {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
