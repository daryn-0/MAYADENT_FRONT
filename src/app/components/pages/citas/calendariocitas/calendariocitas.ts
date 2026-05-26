import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

// Modelos
import { Cita } from '../../../../models/cita';
import { CitaTratamiento } from '../../../../models/cita_tratamiento';
import { Doctor } from '../../../../models/doctor';

// Servicios
import { CitaService } from '../../../../services/cita-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';
import { DoctorService } from '../../../../services/doctor-service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';

interface CitaDelDia {
  cita: Cita;
  tratamientos?: CitaTratamiento[];
}

@Component({
  selector: 'app-calendariocitas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DatePickerModule,
    ButtonModule,
    TagModule,
    ToastModule,
    DialogModule,
    ToolbarModule,
    SelectModule,
    TableModule,
    PanelModule
  ],
  templateUrl: './calendariocitas.html',
  styleUrl: './calendariocitas.css',
  providers: [MessageService]
})
export class Calendariocitas implements OnInit {

  // Datos
  citasActivas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  fechaSeleccionada: Date = new Date();
  citasDelDia: CitaDelDia[] = [];
  citasDeLaSemana: CitaDelDia[] = [];
  
  // Vista actual (solo día y semana)
  vistaActual: 'dia' | 'semana' = 'semana';
  
  // Filtros
  estadoFiltro: string = 'todos';
  estadosDisponibles = [
    { label: 'Todos los Estados', value: 'todos' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Confirmada', value: 'confirmada' },
    { label: 'Atendida', value: 'atendida' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'No Asistió', value: 'no asistió' }
  ];
  
  filtroDoctor: string = 'todos';
  doctoresDisponibles: Doctor[] = [];
  opcionesFiltroDoctor = [
    { label: 'Todos los Doctores', value: 'todos' }
  ];
  
  // Opciones de vista
  opcionesVista = [
    { label: 'Día', value: 'dia' },
    { label: 'Semana', value: 'semana' }
  ];

  // Diálogo de detalles
  displayDetalleDialog: boolean = false;
  citaSeleccionada: Cita | null = null;
  tratamientosCita: CitaTratamiento[] = [];

  // Fechas para navegación
  inicioSemana: Date = new Date();
  finSemana: Date = new Date();
  diasSemana: { fecha: Date, citas: CitaDelDia[] }[] = [];

  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private doctorService: DoctorService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDoctores();
    this.cargarCitas();
    this.calcularSemana();
  }

  cargarDoctores(): void {
    this.doctorService.getDoctores().subscribe({
      next: (data) => {
        this.doctoresDisponibles = data.filter(d => d.estado === 'Activo');
        
        // Actualizar opciones de filtro
        this.opcionesFiltroDoctor = [
          { label: 'Todos los Doctores', value: 'todos' },
          ...this.doctoresDisponibles.map(d => ({
            label: `Dr. ${d.nombre} ${d.apellido}`,
            value: d.id?.toString() || ''
          }))
        ];
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar doctores:', error);
      }
    });
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        if (!data || !Array.isArray(data)) {
          console.warn('No se recibieron citas o el formato es incorrecto');
          this.citasActivas = [];
          this.citasFiltradas = [];
          this.actualizarVista();
          return;
        }
        
        this.citasActivas = data.filter(c => c.estado === 'Activo');
        
        // Cargar tratamientos para cada cita
        this.cargarTratamientosParaCitas();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.citasActivas = [];
        this.citasFiltradas = [];
        this.showToast('error', 'Error', 'No se pudieron cargar las citas');
      }
    });
  }

  cargarTratamientosParaCitas(): void {
    const promesas = this.citasActivas.map(cita => {
      if (cita.id) {
        return this.citaTratamientoService.getCitaTratamientosByCitaId(cita.id).toPromise()
          .then(tratamientos => {
            cita.tratamientos = tratamientos || [];
            return cita;
          })
          .catch(error => {
            console.error(`Error al cargar tratamientos para cita ${cita.id}:`, error);
            cita.tratamientos = [];
            return cita;
          });
      }
      return Promise.resolve(cita);
    });

    Promise.all(promesas).then(() => {
      this.aplicarFiltros();
      this.actualizarVista();
      this.cdr.detectChanges();
    });
  }

  aplicarFiltros(): void {
    let citasFiltradas = [...this.citasActivas];

    // Filtrar por estado
    if (this.estadoFiltro !== 'todos') {
      citasFiltradas = citasFiltradas.filter(cita => 
        cita.estadoCita?.nombre.toLowerCase() === this.estadoFiltro.toLowerCase()
      );
    }

    // Filtrar por doctor
    if (this.filtroDoctor !== 'todos') {
      const doctorId = parseInt(this.filtroDoctor);
      citasFiltradas = citasFiltradas.filter(cita => {
        const tratamientos = cita.tratamientos || [];
        return tratamientos.some((ct: CitaTratamiento) => 
          ct.tratamiento?.doctor?.id === doctorId
        );
      });
    }

    this.citasFiltradas = citasFiltradas;
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
    this.actualizarVista();
  }

  onFiltroDoctorChange(): void {
    this.aplicarFiltros();
    this.actualizarVista();
  }

  obtenerDoctoresDeCita(cita: Cita): string {
    const tratamientos = cita.tratamientos || [];
    const doctores = new Set<string>();
    
    tratamientos.forEach((ct: CitaTratamiento) => {
      if (ct.tratamiento?.doctor) {
        doctores.add(`Dr. ${ct.tratamiento.doctor.nombre} ${ct.tratamiento.doctor.apellido}`);
      }
    });
    
    return doctores.size > 0 ? Array.from(doctores).join(', ') : 'Sin asignar';
  }

  obtenerEtiquetaFiltroDoctor(): string {
    return this.opcionesFiltroDoctor.find(opcion => opcion.value === this.filtroDoctor)?.label || 'Doctor seleccionado';
  }

  actualizarVista(): void {
    if (this.vistaActual === 'dia') {
      this.cargarCitasDelDia();
    } else if (this.vistaActual === 'semana') {
      this.cargarCitasDeLaSemana();
    }
  }

  cargarCitasDelDia(): void {
    const fechaStr = this.formatearFechaParaComparar(this.fechaSeleccionada);
    
    this.citasDelDia = this.citasFiltradas
      .filter(cita => {
        const fechaCitaStr = this.formatearFechaParaComparar(cita.fecha_cita);
        return fechaCitaStr === fechaStr;
      })
      .map(cita => ({ cita }))
      .sort((a, b) => a.cita.hora_cita.localeCompare(b.cita.hora_cita));
  }

  cargarCitasDeLaSemana(): void {
    this.calcularSemana();
    
    // Crear array de días de la semana
    this.diasSemana = [];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(this.inicioSemana);
      fecha.setDate(fecha.getDate() + i);
      
      const fechaStr = this.formatearFechaParaComparar(fecha);
      const citasDelDia = this.citasFiltradas
        .filter(cita => {
          const fechaCitaStr = this.formatearFechaParaComparar(cita.fecha_cita);
          return fechaCitaStr === fechaStr;
        })
        .map(cita => ({ cita }))
        .sort((a, b) => a.cita.hora_cita.localeCompare(b.cita.hora_cita));

      this.diasSemana.push({
        fecha: new Date(fecha),
        citas: citasDelDia
      });
    }
  }

  calcularSemana(): void {
    const fecha = new Date(this.fechaSeleccionada);
    const dia = fecha.getDay();
    const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes como primer día
    
    this.inicioSemana = new Date(fecha.setDate(diff));
    this.finSemana = new Date(this.inicioSemana);
    this.finSemana.setDate(this.inicioSemana.getDate() + 6);
  }

  cambiarVista(nuevaVista: string): void {
    this.vistaActual = nuevaVista as any;
    this.actualizarVista();
  }

  navegarFecha(direccion: 'prev' | 'next'): void {
    const fecha = new Date(this.fechaSeleccionada);
    
    if (this.vistaActual === 'dia') {
      fecha.setDate(fecha.getDate() + (direccion === 'next' ? 1 : -1));
    } else if (this.vistaActual === 'semana') {
      fecha.setDate(fecha.getDate() + (direccion === 'next' ? 7 : -7));
    }
    
    this.fechaSeleccionada = fecha;
    this.actualizarVista();
  }

  irAHoy(): void {
    this.fechaSeleccionada = new Date();
    this.actualizarVista();
  }

  onFechaSeleccionada(): void {
    this.actualizarVista();
  }

  verDetalleCita(cita: Cita): void {
    if (!cita.id) return;
    
    this.citaSeleccionada = cita;
    
    // Cargar tratamientos de la cita
    this.citaTratamientoService.getCitaTratamientosByCitaId(cita.id).subscribe({
      next: (data) => {
        this.tratamientosCita = data;
        this.displayDetalleDialog = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tratamientos:', error);
        this.tratamientosCita = [];
        this.displayDetalleDialog = true;
        this.showToast('error', 'Error', 'No se pudieron cargar los tratamientos de la cita');
      }
    });
  }

  calcularTotalCita(): number {
    if (!this.tratamientosCita || this.tratamientosCita.length === 0) {
      return 0;
    }
    return this.tratamientosCita.reduce((total, ct) => total + ct.costo_final, 0);
  }

  getSeverityEstadoCita(estadoCita: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (estadoCita?.toLowerCase()) {
      case 'pendiente':
        return 'warn';
      case 'confirmada':
        return 'info';
      case 'atendida':
        return 'success';
      case 'cancelada':
        return 'danger';
      case 'no asistió':
        return 'secondary';
      default:
        return 'info';
    }
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? this.parsearFechaLocal(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  formatearFechaParaComparar(fecha: Date | string): string {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? this.parsearFechaLocal(fecha) : fecha;
    return date.toISOString().split('T')[0];
  }

  parsearFechaLocal(fecha: Date | string): Date {
    if (fecha instanceof Date) return fecha;
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  obtenerNombreDia(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', { weekday: 'long' });
  }

  obtenerFechaCorta(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  }

  contarCitasPorEstado(estado: string): number {
    if (this.vistaActual === 'dia') {
      return this.citasDelDia.filter(cd => 
        cd.cita.estadoCita?.nombre.toLowerCase() === estado.toLowerCase()
      ).length;
    }
    return this.citasFiltradas.filter(c => 
      c.estadoCita?.nombre.toLowerCase() === estado.toLowerCase()
    ).length;
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}