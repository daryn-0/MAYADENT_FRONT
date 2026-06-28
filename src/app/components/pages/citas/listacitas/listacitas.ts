import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-listacitas',
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
    ToolbarModule,
    SelectModule
  ],
  templateUrl: './listacitas.html',
  styleUrl: './listacitas.css',
  providers: [MessageService]
})
export class Listacitas implements OnInit {

  citasActivas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  selectedCita: Cita | null = null;
  
  // Diálogo para ver tratamientos
  displayTratamientosDialog: boolean = false;
  tratamientosCita: CitaTratamiento[] = [];
  
  // Filtros
  doctoresDisponibles: Doctor[] = [];
  filtroDoctor: string = 'todos';
  opcionesFiltroDoctor = [
    { label: 'Todos los Doctores', value: 'todos' }
  ];
  
  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private doctorService: DoctorService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.citasActivas = [];
    this.citasFiltradas = [];
    this.cargarDoctores();
    this.cargarCitas();
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
        // Validar que data no sea null o undefined
        if (!data || !Array.isArray(data)) {
          console.warn('No se recibieron citas o el formato es incorrecto');
          this.citasActivas = [];
          this.aplicarFiltros();
          return;
        }
        
        // Filtrar solo las citas con estado 'Activo'
        this.citasActivas = data.filter(c => c.estado === 'Activo');
        console.log('Citas activas cargadas:', this.citasActivas);
        
        // Cargar tratamientos para cada cita para obtener doctores
        this.cargarTratamientosParaCitas();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.citasActivas = [];
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
      this.cdr.detectChanges();
    });
  }

  aplicarFiltros(): void {
    let citasFiltradas = [...this.citasActivas];

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

  onFiltroDoctorChange(): void {
    this.aplicarFiltros();
    this.cdr.detectChanges();
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

  obtenerTotalCita(cita: Cita): number {
    const tratamientos = cita.tratamientos || [];
    return tratamientos.reduce((total, ct) => total + (ct.costo_final || 0), 0);
  }

  obtenerEtiquetaFiltroDoctor(): string {
    return this.opcionesFiltroDoctor.find(opcion => opcion.value === this.filtroDoctor)?.label || 'Doctor seleccionado';
  }

  verTratamientos(cita: Cita): void {
    if (!cita.id) return;
    
    this.selectedCita = cita;
    
    // Cargar los tratamientos de la cita
    this.citaTratamientoService.getCitaTratamientosByCitaId(cita.id).subscribe({
      next: (data) => {
        this.tratamientosCita = data;
        this.displayTratamientosDialog = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tratamientos:', error);
        this.showToast('error', 'Error', 'No se pudieron cargar los tratamientos de la cita');
      }
    });
  }

  calcularTotalCita(tratamientos: CitaTratamiento[]): number {
    if (!tratamientos || tratamientos.length === 0) {
      return 0;
    }
    return tratamientos.reduce((total, ct) => total + ct.costo_final, 0);
  }

  getSeverityEstadoCita(estadoCita: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (estadoCita?.toLowerCase()) {
      case 'pendiente':
        return 'warn';
      case 'confirmada':
        return 'info';
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    // Usar parseo local para evitar problemas de zona horaria
    const date = typeof fecha === 'string' ? this.parsearFechaLocal(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  parsearFechaLocal(fechaString: string): Date {
    // Parsear la fecha en formato yyyy-MM-dd sin conversión de zona horaria
    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  }

  irARegistro(): void {
    this.router.navigate(['/citas/registro']);
  }

  irAGestion(): void {
    this.router.navigate(['/citas/gestion']);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
