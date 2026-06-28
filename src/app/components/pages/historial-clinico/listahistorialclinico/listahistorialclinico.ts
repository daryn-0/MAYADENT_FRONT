import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { HistorialClinico } from '../../../../models/historial_clinico';
import { Paciente } from '../../../../models/paciente';
import { HistorialClinicoService } from '../../../../services/historial-clinico-service';

interface PacienteConHistoriales {
  paciente: Paciente;
  historiales: HistorialClinico[];
}

@Component({
  selector: 'app-listahistorialclinico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    TagModule,
    ToastModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    DialogModule
  ],
  templateUrl: './listahistorialclinico.html',
  styleUrl: './listahistorialclinico.css',
  providers: [MessageService]
})
export class Listahistorialclinico implements OnInit {
  pacientesConHistoriales: PacienteConHistoriales[] = [];
  pacientesFiltrados: PacienteConHistoriales[] = [];
  filtroPaciente: string = '';
  loading: boolean = true;

  // Dialog lista de historiales del paciente
  selectedPaciente: PacienteConHistoriales | null = null;
  displayHistorialDialog: boolean = false;
  filtroFecha: string = '';
  historialesFiltradosPorFecha: HistorialClinico[] = [];

  // Dialog detalle de un historial
  selectedHistorial: HistorialClinico | null = null;
  displayDetalleDialog: boolean = false;

  constructor(
    private historialClinicoService: HistorialClinicoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarHistoriales();
  }

  cargarHistoriales(): void {
    this.loading = true;
    this.historialClinicoService.getHistoriales().subscribe({
      next: (data) => {
        const activos = data.filter(h => h.estado === 'Activo');
        this.pacientesConHistoriales = this.agruparPorPaciente(activos);
        this.pacientesFiltrados = [...this.pacientesConHistoriales];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los historiales clínicos' });
      }
    });
  }

  private agruparPorPaciente(historiales: HistorialClinico[]): PacienteConHistoriales[] {
    const mapa = new Map<number, PacienteConHistoriales>();
    for (const h of historiales) {
      const paciente = h.paciente ?? h.cita?.paciente ?? null;
      if (!paciente?.id) continue;
      if (!mapa.has(paciente.id)) {
        mapa.set(paciente.id, { paciente, historiales: [] });
      }
      mapa.get(paciente.id)!.historiales.push(h);
    }
    return Array.from(mapa.values());
  }

  filtrarPorPaciente(): void {
    const termino = this.filtroPaciente.toLowerCase().trim();
    if (!termino) {
      this.pacientesFiltrados = [...this.pacientesConHistoriales];
      return;
    }
    this.pacientesFiltrados = this.pacientesConHistoriales.filter(p => {
      const nombre = `${p.paciente.nombre} ${p.paciente.apellido}`.toLowerCase();
      const dni = p.paciente.dni.toLowerCase();
      return nombre.includes(termino) || dni.includes(termino);
    });
  }

  seleccionarPaciente(item: PacienteConHistoriales): void {
    this.selectedPaciente = item;
    this.filtroFecha = '';
    this.historialesFiltradosPorFecha = [...item.historiales];
    this.displayHistorialDialog = true;
  }

  filtrarPorFecha(): void {
    const termino = this.filtroFecha.toLowerCase().trim();
    if (!this.selectedPaciente) return;
    if (!termino) {
      this.historialesFiltradosPorFecha = [...this.selectedPaciente.historiales];
      return;
    }
    this.historialesFiltradosPorFecha = this.selectedPaciente.historiales.filter(h => {
      const fechaEmision = this.formatearFecha(h.fecha_emision).toLowerCase();
      const fechaCita = this.obtenerFechaCita(h).toLowerCase();
      return fechaEmision.includes(termino) || fechaCita.includes(termino);
    });
  }

  verDetalleHistorial(historial: HistorialClinico): void {
    this.selectedHistorial = historial;
    this.displayDetalleDialog = true;
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'Sin fecha';
    if (typeof fecha === 'string') {
      const [year, month, day] = fecha.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    return fecha.toLocaleDateString('es-PE');
  }

  obtenerFechaCita(historial: HistorialClinico): string {
    return historial.cita?.fecha_cita ? this.formatearFecha(historial.cita.fecha_cita) : 'Sin cita';
  }
}
