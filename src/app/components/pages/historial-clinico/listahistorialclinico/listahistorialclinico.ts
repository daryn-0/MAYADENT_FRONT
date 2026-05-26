import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { HistorialClinico } from '../../../../models/historial_clinico';
import { HistorialClinicoService } from '../../../../services/historial-clinico-service';

@Component({
  selector: 'app-listahistorialclinico',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    TagModule,
    ToastModule,
    CardModule
  ],
  templateUrl: './listahistorialclinico.html',
  styleUrl: './listahistorialclinico.css',
  providers: [MessageService]
})
export class Listahistorialclinico implements OnInit {
  historiales: HistorialClinico[] = [];
  loading: boolean = true;

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
        this.historiales = data.filter(historial => historial.estado === 'Activo');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historiales clínicos:', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los historiales clínicos' });
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
}
