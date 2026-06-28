import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { HistorialClinico } from '../../../../models/historial_clinico';
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
    TagModule,
    TooltipModule
  ],
  templateUrl: './gestionarhistorialclinico.html',
  styleUrl: './gestionarhistorialclinico.css',
  providers: [MessageService]
})
export class Gestionarhistorialclinico implements OnInit {
  historiales: HistorialClinico[] = [];
  historialesFiltrados: HistorialClinico[] = [];
  filtroPaciente: string = '';
  selectedHistorial: HistorialClinico | null = null;
  historialParaForm: HistorialClinico = new HistorialClinico();
  displayAccionesDialog: boolean = false;
  displayFormDialog: boolean = false;
  loading: boolean = true;

  @ViewChild('historialForm') historialForm!: NgForm;

  constructor(
    private historialClinicoService: HistorialClinicoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarHistoriales();
  }

  cargarHistoriales(): void {
    this.loading = true;
    this.historialClinicoService.getHistoriales().subscribe({
      next: (data) => {
        this.historiales = data;
        this.historialesFiltrados = [...this.historiales];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historiales clínicos:', error);
        this.loading = false;
        this.showToast('error', 'Error', 'No se pudieron cargar los historiales clínicos');
      }
    });
  }

  filtrarPorPaciente(): void {
    const termino = this.filtroPaciente.toLowerCase().trim();
    if (!termino) {
      this.historialesFiltrados = [...this.historiales];
      return;
    }
    this.historialesFiltrados = this.historiales.filter(h => {
      const paciente = h.paciente || h.cita?.paciente;
      const nombre = `${paciente?.nombre || ''} ${paciente?.apellido || ''}`.toLowerCase();
      const dni = (paciente?.dni || '').toLowerCase();
      return nombre.includes(termino) || dni.includes(termino);
    });
  }

  onRowSelect(event: any): void {
    this.selectedHistorial = event.data;
    this.displayAccionesDialog = true;
  }

  seleccionarHistorial(historial: HistorialClinico): void {
    this.selectedHistorial = historial;
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

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'Sin fecha';
    if (typeof fecha === 'string') {
      const [year, month, day] = fecha.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    return fecha.toLocaleDateString('es-PE');
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

