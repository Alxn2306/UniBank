import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientosService } from '../../../services/movimientos.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  cargando: boolean = false;
  error: string | null = null;
  nombreCliente: string = '';
  correoCliente: string = '';

  constructor(
    private movimientosService: MovimientosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const user = JSON.parse(userStr);
      this.clienteId = user.id;
      this.nombreCliente = user.nombre || 'Cliente';
      this.correoCliente = user.correo || '';
      console.log('Cliente ID:', this.clienteId);
    }

    this.cargarMovimientos();
  }

  cargarMovimientos(): void {
    console.log('Iniciando carga de movimientos...');
    this.cargando = true;
    this.error = null;
    
    this.movimientosService.obtenerMovimientos().subscribe({
      next: (response) => {
        console.log('Respuesta completa:', response);
        
        if (response.success) {
          this.movimientos = response.movimientos || [];
          console.log('Movimientos cargados:', this.movimientos.length);
        } else {
          this.error = response.mensaje || 'Error al cargar movimientos';
        }
        
        this.cargando = false;
        this.cdr.detectChanges();
        console.log('Carga completada. Cargando:', this.cargando);
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al conectar con el servidor';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

descargarEstadoCuenta(): void {
  const doc = new jsPDF();
  
  // Header con logo y título
  doc.setFillColor(138, 77, 245); // Morado primario
  doc.rect(0, 0, 210, 40, 'F');
  
  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIBANK', 105, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Estado de Cuenta', 105, 28, { align: 'center' });
  
  // Información del cliente
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Información del Cliente', 14, 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${this.nombreCliente}`, 14, 58);
  doc.text(`Correo: ${this.correoCliente}`, 14, 64);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, 14, 70);
  
  // Calcular totales
  let totalIngresos = 0;
  let totalEgresos = 0;
  
  this.movimientos.forEach(mov => {
    if (mov.destinatario_id === this.clienteId) {
      totalIngresos += parseFloat(mov.monto);
    } else if (mov.remitente_id === this.clienteId) {
      totalEgresos += parseFloat(mov.monto) + parseFloat(mov.comision || 0);
    }
  });
  
  // Resumen financiero
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen Financiero', 14, 80);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(46, 125, 50); // Verde
  doc.text(`Total Ingresos: $${totalIngresos.toFixed(2)}`, 14, 88);
  
  doc.setTextColor(211, 47, 47); // Rojo
  doc.text(`Total Egresos: $${totalEgresos.toFixed(2)}`, 14, 94);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Balance Neto: $${(totalIngresos - totalEgresos).toFixed(2)}`, 14, 100);
  
  // Tabla de movimientos
  const tableData = this.movimientos.map((mov, index) => {
    const esSalida = mov.remitente_id === this.clienteId;
    const tipo = esSalida ? 'Enviado' : 'Recibido';
    const contrapart = esSalida ? mov.destinatario : mov.remitente;
    const monto = esSalida ? `-$${mov.monto}` : `+$${mov.monto}`;
    const fecha = new Date(mov.fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return [
      index + 1,
      fecha,
      tipo,
      contrapart,
      monto,
      `$${mov.comision || 0}`
    ];
  });
  
  autoTable(doc, {
    startY: 110,
    head: [['#', 'Fecha', 'Tipo', 'Contraparte', 'Monto', 'Comisión']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [138, 77, 245], // Morado primario
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 50 },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' }
    },
    didParseCell: (data) => {
      // Colorear monto según tipo
      if (data.column.index === 4 && data.section === 'body') {
        const value = data.cell.text[0];
        if (value.startsWith('+')) {
          data.cell.styles.textColor = [46, 125, 50]; // Verde
        } else if (value.startsWith('-')) {
          data.cell.styles.textColor = [211, 47, 47]; // Rojo
        }
      }
    }
  });
  
  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'Este documento es generado automáticamente por UNIBANK',
      105,
      doc.internal.pageSize.height - 6,
      { align: 'center' }
    );
  }
  
  // Descargar el PDF
  const fechaDescarga = new Date().toISOString().split('T')[0];
  doc.save(`Estado_Cuenta_${fechaDescarga}.pdf`);
}
}