import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientosService } from '../../../services/movimientos.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movimientos.html',
  styleUrls: ['./movimientos.css']
})
export class Movimientos implements OnInit {
  movimientos: any[] = [];
  clienteId: number | null = null;
  cargando: boolean = false;  // ← Cambia a false inicialmente
  error: string | null = null;

  constructor(
    private movimientosService: MovimientosService,
    private cdr: ChangeDetectorRef  // ← Añade esto
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      this.clienteId = user.id;
      console.log('👤 Cliente ID:', this.clienteId);
    }

    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    console.log('🔄 Iniciando carga de movimientos...');
    this.cargando = true;
    this.error = null;
    
    this.movimientosService.obtenerMovimientos().subscribe({
      next: (response) => {
        console.log('📦 Respuesta completa:', response);
        
        if (response.success) {
          this.movimientos = response.movimientos || [];
          console.log('✅ Movimientos cargados:', this.movimientos.length);
        } else {
          this.error = response.mensaje || 'Error al cargar movimientos';
        }
        
        this.cargando = false;
        this.cdr.detectChanges();  // ← Fuerza la actualización de la vista
        console.log('🏁 Carga completada. Cargando:', this.cargando);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.error = 'Error al conectar con el servidor';
        this.cargando = false;
        this.cdr.detectChanges();  // ← Fuerza la actualización de la vista
      }
    });
  }
}