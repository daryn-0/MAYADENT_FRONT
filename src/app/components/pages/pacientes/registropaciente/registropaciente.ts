import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Paciente } from '../../../../models/paciente';
import { PacienteService } from '../../../../services/paciente-service';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from "primeng/floatlabel";
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker'; // Importar el Módulo
import { RadioButtonModule } from 'primeng/radiobutton'; // Importar el Módulo
import { ToastModule } from 'primeng/toast'; // 2. Módulo para las notificaciones
import { MessageService } from 'primeng/api'; // 3. Servicio para *mostrar* notificaciones

@Component({
  selector: 'app-registro-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    DatePickerModule, 
    RadioButtonModule, 
    ToastModule
  ],
  templateUrl: './registropaciente.html',
  styleUrls: ['./registropaciente.css'],
  providers: [MessageService]
})
export class RegistroPacientes {
  paciente: Paciente = new Paciente();

  constructor(
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) { }

  onSubmit() {
    // --- VALIDACIÓN 1: Longitud de campos (Como estaba antes) ---
    if (!this.paciente.dni || this.paciente.dni.length !== 8) {
      this.messageService.add({ severity: 'warn', summary: 'DNI Inválido', detail: 'El DNI debe tener 8 dígitos.' });
      return;
    }
    if (!this.paciente.telefono || this.paciente.telefono.length !== 9) {
      this.messageService.add({ severity: 'warn', summary: 'Teléfono Inválido', detail: 'El teléfono debe tener 9 dígitos.' });
      return;
    }

    // --- VALIDACIÓN 2: DNI Duplicado (Este es el único cambio) ---
    this.pacienteService.getPacienteByDni(this.paciente.dni).subscribe({
      next: (pacienteExistente) => {
        // SI HAY ÉXITO: El DNI ya existe. MALO.
        console.warn('DNI ya registrado:', pacienteExistente);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'DNI Duplicado', 
          detail: 'Ya existe un paciente registrado con ese DNI.' 
        });
      },
      error: (err) => {
        // SI HAY ERROR (ej. 404): El DNI está libre. BUENO.
        // --- AHORA SÍ, PEGAMOS TODA LA LÓGICA DE REGISTRO ORIGINAL ---
        
        this.paciente.estado = 'Activo';

        // Formatear fecha
        const fechaFormateada = this.paciente.fecha_nacimiento
          ? new Date(this.paciente.fecha_nacimiento).toISOString().split('T')[0]
          : null;

        // Crear objeto a enviar
        const pacienteAEnviar: Paciente = {
          ...this.paciente,
          id: undefined, 
          fecha_nacimiento: fechaFormateada as unknown as Date
        };

        console.log('📦 Enviando al backend:', pacienteAEnviar);

        // Llamar al backend
        this.pacienteService.createPaciente(pacienteAEnviar).subscribe({
          next: (response) => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente registrado con éxito' });
            this.paciente = new Paciente(); // Limpiamos el modelo
          },
          error: (error) => {
            console.error('Error al registrar paciente:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar al paciente.' });
          }
        });
        // --- FIN DE LA LÓGICA ORIGINAL ---
      }
    });
  }
}
