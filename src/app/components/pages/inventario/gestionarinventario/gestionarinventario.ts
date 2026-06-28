import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Inventario } from '../../../../models/inventario';
import { InventarioService } from '../../../../services/inventario-service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-gestionarinventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    DatePickerModule,
    InputNumberModule
  ],
  templateUrl: './gestionarinventario.html',
  styleUrl: './gestionarinventario.css',
  providers: [MessageService, ConfirmationService]
})
export class Gestionarinventario implements OnInit {

  inventariosActivos: Inventario[] = [];
  selectedInventario: Inventario | null = null;
  inventarioParaForm: Inventario = new Inventario();
  
  displayAccionesDialog: boolean = false;
  displayFormDialog: boolean = false;

  @ViewChild('inventarioForm') inventarioForm!: NgForm;

  constructor(
    private inventarioService: InventarioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inventariosActivos = [];
    this.cargarInventarios();
  }

  cargarInventarios(): void {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        if (!data || !Array.isArray(data)) {
          this.inventariosActivos = [];
          this.cdr.detectChanges();
          return;
        }
        this.inventariosActivos = data.filter(i => i.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar inventarios:', error);
        this.inventariosActivos = [];
        this.showToast('error', 'Error', 'No se pudieron cargar los inventarios');
      }
    });
  }

  onRowSelect(event: any): void {
    this.selectedInventario = event.data;
    this.displayAccionesDialog = true;
  }

  abrirDialogEditar(): void {
    if (!this.selectedInventario) return;

    this.inventarioParaForm = { ...this.selectedInventario };
    
    if (typeof this.inventarioParaForm.fecha_vencimiento === 'string') {
      this.inventarioParaForm.fecha_vencimiento = this.parsearFechaLocal(this.inventarioParaForm.fecha_vencimiento);
    }

    this.displayAccionesDialog = false;
    this.displayFormDialog = true;
  }

  guardarInventario(): void {
    if (!this.inventarioForm.form.valid) {
      this.showToast('warn', 'Formulario Inválido', 'Revise los campos requeridos');
      return;
    }

    const idInventario = this.inventarioParaForm.id!;
    const inventarioParaEnviar = this.prepararInventarioParaBackend(this.inventarioParaForm);

    this.inventarioService.updateInventario(idInventario, inventarioParaEnviar).subscribe({
      next: () => {
        this.showToast('success', 'Actualizado', 'Item actualizado con éxito');
        this.cargarInventarios();
        this.displayFormDialog = false;
      },
      error: () => this.showToast('error', 'Error', 'No se pudo actualizar el item')
    });
  }

  confirmarCambioEstado(): void {
    if (!this.selectedInventario) return;

    const idInventario = this.selectedInventario.id!;
    const estadoActual = this.selectedInventario.estado;
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    const inventarioActualizado = {
      ...this.selectedInventario,
      estado: nuevoEstado
    };

    this.confirmationService.confirm({
      message: `Â¿Está seguro de cambiar el estado del item a ${nuevoEstado}?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.inventarioService.updateInventario(idInventario, this.prepararInventarioParaBackend(inventarioActualizado)).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', `Item ahora está ${nuevoEstado}`);
            this.cargarInventarios();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.selectedInventario) return;

    const idInventario = this.selectedInventario.id!;

    this.confirmationService.confirm({
      message: 'Â¿Está seguro de ELIMINAR PERMANENTEMENTE este item?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.inventarioService.deleteInventario(idInventario).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Item eliminado permanentemente');
            this.cargarInventarios();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo eliminar el item')
        });
      }
    });
  }

  prepararInventarioParaBackend(inventario: any): any {
    const fechaFormateada = inventario.fecha_vencimiento 
      ? this.formatearFecha(inventario.fecha_vencimiento)
      : null;

    return {
      ...inventario,
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

  formatearFechaDisplay(fecha: Date | string): string {
    if (!fecha) return 'Sin vencimiento';
    const date = typeof fecha === 'string' ? this.parsearFechaLocal(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  parsearFechaLocal(fechaString: string): Date {
    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  getSeverityStock(cantidad: number): 'success' | 'warn' | 'danger' {
    if (cantidad > 20) return 'success';
    if (cantidad > 5) return 'warn';
    return 'danger';
  }

  onAccionesDialogHide(): void {
    this.selectedInventario = null;
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}



