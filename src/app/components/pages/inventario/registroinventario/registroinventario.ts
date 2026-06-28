import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Inventario } from '../../../../models/inventario';
import { InventarioService } from '../../../../services/inventario-service';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-registroinventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    FloatLabelModule,
    ToastModule,
    InputNumberModule
  ],
  templateUrl: './registroinventario.html',
  styleUrl: './registroinventario.css',
  providers: [MessageService]
})
export class Registroinventario implements OnInit {

  inventarioForm: Inventario = new Inventario();

  constructor(
    private inventarioService: InventarioService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.inventarioForm = new Inventario();
    this.inventarioForm.estado = 'Activo';
    this.inventarioForm.usuario = { id: 1 }; // Usuario por defecto
  }

  validarFormulario(): boolean {
    if (!this.inventarioForm.nombre || this.inventarioForm.nombre.trim() === '') {
      this.showToast('warn', 'Validación', 'El nombre es obligatorio');
      return false;
    }

    if (this.inventarioForm.cantidad < 0) {
      this.showToast('warn', 'Validación', 'La cantidad no puede ser negativa');
      return false;
    }

    if (!this.inventarioForm.unidad_medida || this.inventarioForm.unidad_medida.trim() === '') {
      this.showToast('warn', 'Validación', 'La unidad de medida es obligatoria');
      return false;
    }

    if (this.inventarioForm.costo_unitario < 0) {
      this.showToast('warn', 'Validación', 'El costo unitario no puede ser negativo');
      return false;
    }

    return true;
  }

  registrarInventario(): void {
    if (!this.validarFormulario()) {
      return;
    }

    const inventarioParaEnviar = this.prepararInventarioParaBackend();

    this.inventarioService.createInventario(inventarioParaEnviar).subscribe({
      next: () => {
        this.showToast('success', 'Éxito', 'Item de inventario registrado correctamente');
        setTimeout(() => {
          this.limpiarFormulario();
        }, 1500);
      },
      error: (error) => {
        console.error('Error al registrar inventario:', error);
        this.showToast('error', 'Error', 'No se pudo registrar el item');
      }
    });
  }

  prepararInventarioParaBackend(): any {
    const fechaFormateada = this.inventarioForm.fecha_vencimiento 
      ? this.formatearFecha(this.inventarioForm.fecha_vencimiento)
      : null;

    return {
      ...this.inventarioForm,
      fecha_vencimiento: fechaFormateada
    };
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  limpiarFormulario(): void {
    this.inicializarFormulario();
    this.cdr.detectChanges();
  }

  cancelar(): void {
    this.router.navigate(['/inventario/lista']);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}

