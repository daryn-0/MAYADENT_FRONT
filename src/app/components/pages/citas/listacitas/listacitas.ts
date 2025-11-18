import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// Modelos
import { Cita } from '../../../../models/cita';
import { CitaTratamiento } from '../../../../models/cita_tratamiento';

// Servicios
import { CitaService } from '../../../../services/cita-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';

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
    ToolbarModule
  ],
  templateUrl: './listacitas.html',
  styleUrl: './listacitas.css',
  providers: [MessageService]
})
export class Listacitas implements OnInit {

  citasActivas: Cita[] = [];
  selectedCita: Cita | null = null;
  
  // Diálogo para ver tratamientos
  displayTratamientosDialog: boolean = false;
  tratamientosCita: CitaTratamiento[] = [];
  
  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.citasActivas = [];
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        // Filtrar solo las citas con estado 'Activo'
        this.citasActivas = data.filter(c => c.estado === 'Activo');
        console.log('Citas activas cargadas:', this.citasActivas);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.showToast('error', 'Error', 'No se pudieron cargar las citas');
      }
    });
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
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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
