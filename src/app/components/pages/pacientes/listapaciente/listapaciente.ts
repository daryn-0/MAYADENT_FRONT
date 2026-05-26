import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacienteService } from '../../../../services/paciente-service';
import { Paciente } from '../../../../models/paciente';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext'; // Para el filtro de búsqueda
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'; // Para notificaciones de error
@Component({
  selector: 'app-listapaciente',
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './listapaciente.html',
  styleUrl: './listapaciente.css',
  providers: [MessageService] 
})
export class Listapaciente implements OnInit{
  pacientes: Paciente[] = [];
  loading: boolean = true; // Para mostrar un 'cargando' en la tabla

  constructor(
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarPacientesActivos();
  }

  cargarPacientesActivos(): void {
    this.loading = true; 
    // Asumimos que este servicio ya solo trae pacientes "Activos"
    this.pacienteService.getPacientesActivos().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.loading = false;
        console.log('Pacientes activos cargados:', this.pacientes);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al cargar pacientes:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'No se pudieron cargar los pacientes.' 
        });
      }
    });
  }
}
