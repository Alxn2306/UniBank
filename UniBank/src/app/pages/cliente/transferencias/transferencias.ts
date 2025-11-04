import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';              // NgIf, NgFor, number pipe
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-transferencias',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transferencias.html',
  styleUrls: ['./transferencias.css']
})
export class Transferencias {
  // ===== Mock inicial (reemplaza luego con datos del backend) =====
  cuentas: Array<{ id: number; bancoId: number; alias: string; saldo: number }> = [
    { id: 1, bancoId: 1, alias: 'Cuenta Nómina', saldo: 12500.00 },
    { id: 2, bancoId: 2, alias: 'Cuenta Ahorro', saldo: 3400.50 },
  ];

  contactos: Array<{ id: number; alias: string; banco_id: number; tipo_destino: string; destino_valor: string }> = [
    { id: 1, alias: 'Luis', banco_id: 1, tipo_destino: 'clabe',  destino_valor: '123456789012345678' },
    { id: 2, alias: 'Mamá', banco_id: 2, tipo_destino: 'phone',  destino_valor: '5512345678' }
  ];

  form!: FormGroup;
  formContacto!: FormGroup;
  searchText = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      origen_cuenta_id: [this.cuentas[0]?.id ?? null, Validators.required],
      destino_banco_id: [1, Validators.required],
      tipo_destino: ['clabe', Validators.required],
      destino_valor: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.formContacto = this.fb.group({
      alias: ['', Validators.required],
    });
  }

  get saldoDisponible(): number {
    const id = this.form.value.origen_cuenta_id;
    return this.cuentas.find(c => c.id === id)?.saldo ?? 0;
  }
  get comision(): number {
    const monto = +(this.form.value.monto ?? 0);
    if (monto <= 0) return 0;
    const cincoPorc = monto * 0.05;
    const extra1500 = Math.floor(monto / 1500) * 10;
    return +(cincoPorc + extra1500).toFixed(2);
  }
  get totalDebitar(): number {
    const monto = +(this.form.value.monto ?? 0);
    return monto > 0 ? +(monto + this.comision).toFixed(2) : 0;
  }
  get saldoInsuficiente(): boolean {
    return this.totalDebitar > this.saldoDisponible;
  }

  get contactosFiltrados() {
    const q = (this.searchText || '').toLowerCase().trim();
    if (!q) return this.contactos;
    return this.contactos.filter(c =>
      c.alias.toLowerCase().includes(q) ||
      c.destino_valor.toLowerCase().includes(q) ||
      c.tipo_destino.toLowerCase().includes(q)
    );
  }
  cargarDesdeContacto(ct: any) {
    this.form.patchValue({
      destino_banco_id: ct.banco_id,
      tipo_destino: ct.tipo_destino,
      destino_valor: ct.destino_valor
    });
  }
  puedeAgregarContacto(): boolean {
    return this.formContacto.valid &&
           !!this.form.value.destino_banco_id &&
           !!this.form.value.tipo_destino &&
           !!(this.form.value.destino_valor || '').trim();
  }
  agregarContacto() {
    if (!this.puedeAgregarContacto()) return;
    const nuevo = {
      id: Date.now(),
      alias: this.formContacto.value.alias,
      banco_id: this.form.value.destino_banco_id,
      tipo_destino: this.form.value.tipo_destino,
      destino_valor: (this.form.value.destino_valor || '').trim()
    };
    this.contactos = [nuevo, ...this.contactos];
    this.formContacto.reset();
    alert('Contacto agregado.');
  }
  enviarTransferencia() {
    if (this.form.invalid || this.saldoInsuficiente) return;
    const payload = {
      usuario_id: 1,
      origen_cuenta_id: this.form.value.origen_cuenta_id,
      destino_banco_id: this.form.value.destino_banco_id,
      tipo_destino: this.form.value.tipo_destino,
      destino_valor: (this.form.value.destino_valor || '').trim(),
      monto: +this.form.value.monto,
      comision: this.comision,
      total_debito: this.totalDebitar
    };
    console.log('Transferencia payload ->', payload);
    alert('Transferencia preparada. Revisa la consola.');
  }
}
