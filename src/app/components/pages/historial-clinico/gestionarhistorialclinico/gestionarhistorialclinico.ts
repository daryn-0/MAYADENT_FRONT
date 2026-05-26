import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';
import { HistorialClinico, EstadoHistorialClinico } from '../../../../models/historial_clinico';
import { HistorialClinicoService } from '../../../../services/historial-clinico-service';

@Component({
  selector: 'app-gestionarhistorialclinico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    RadioButtonModule
  ],
  templateUrl: './gestionarhistorialclinico.html',
  styleUrl: './gestionarhistorialclinico.css',
  providers: [MessageService, ConfirmationService]
})
export class Gestionarhistorialclinico implements OnInit {
  historiales: HistorialClinico[] = [];
  selectedHistorial: HistorialClinico | null = null;
  historialParaForm: HistorialClinico = new HistorialClinico();
  displayAccionesDialog: boolean = false;
  displayFormDialog: boolean = false;
  loading: boolean = true;

  @ViewChild('historialForm') historialForm!: NgForm;

  constructor(
    private historialClinicoService: HistorialClinicoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.cargarHistoriales();
  }

  cargarHistoriales(): void {
    this.loading = true;
    this.historialClinicoService.getHistoriales().subscribe({
      next: (data) => {
        this.historiales = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historiales clínicos:', error);
        this.loading = false;
        this.showToast('error', 'Error', 'No se pudieron cargar los historiales clínicos');
      }
    });
  }

  onRowSelect(event: any): void {
    this.selectedHistorial = event.data;
    this.displayAccionesDialog = true;
  }

  abrirDialogEditar(): void {
    if (!this.selectedHistorial) return;
    this.historialParaForm = { ...this.selectedHistorial };
    this.displayAccionesDialog = false;
    this.displayFormDialog = true;
  }

  guardarHistorial(): void {
    if (!this.historialForm.form.valid) {
      this.showToast('warn', 'Formulario inválido', 'Revise los campos requeridos');
      return;
    }

    if (!this.historialParaForm.id) {
      this.showToast('error', 'Error', 'No se puede guardar un historial sin ID');
      return;
    }

    this.historialClinicoService.updateHistorial(this.historialParaForm.id, this.historialParaForm).subscribe({
      next: () => {
        this.showToast('success', 'Actualizado', 'Historial clínico actualizado correctamente');
        this.displayFormDialog = false;
        this.cargarHistoriales();
      },
      error: (error) => {
        console.error('Error al actualizar historial clínico:', error);
        this.showToast('error', 'Error', 'No se pudo actualizar el historial clínico');
      }
    });
  }

  confirmarCambioEstado(): void {
    if (!this.selectedHistorial || !this.selectedHistorial.id) return;

    const nuevoEstado: EstadoHistorialClinico = this.selectedHistorial.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const historialActualizado: HistorialClinico = {
      ...this.selectedHistorial,
      estado: nuevoEstado
    };

    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado a ${nuevoEstado}?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.historialClinicoService.updateHistorial(this.selectedHistorial!.id!, historialActualizado).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', `Historial ahora está ${nuevoEstado}`);
            this.displayAccionesDialog = false;
            this.cargarHistoriales();
          },
          error: (error) => {
            console.error('Error al cambiar estado del historial:', error);
            this.showToast('error', 'Error', 'No se pudo cambiar el estado del historial');
          }
        });
      }
    });
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'Sin fecha';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE');
  }

  obtenerPaciente(historial: HistorialClinico): string {
    const paciente = historial.paciente || historial.cita?.paciente;
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Sin paciente';
  }

  obtenerDni(historial: HistorialClinico): string {
    return historial.paciente?.dni || historial.cita?.paciente?.dni || 'Sin DNI';
  }

  obtenerFechaCita(historial: HistorialClinico): string {
    return historial.cita?.fecha_cita ? this.formatearFecha(historial.cita.fecha_cita) : 'Sin cita';
  }

  onAccionesDialogHide(): void {
    this.selectedHistorial = null;
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
