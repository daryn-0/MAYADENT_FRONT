import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

// Modelos
import { Cita } from '../../../../models/cita';
import { CitaTratamiento } from '../../../../models/cita_tratamiento';
import { Paciente } from '../../../../models/paciente';
import { Tratamiento } from '../../../../models/tratamiento';
import { EstadoCita } from '../../../../models/estado_cita';
import { Usuario } from '../../../../models/usuario';

// Servicios
import { CitaService } from '../../../../services/cita-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';
import { PacienteService } from '../../../../services/paciente-service';
import { TratamientoService } from '../../../../services/tratamiento-service';
import { EstadoCitaService } from '../../../../services/estado-cita-service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';

// Interfaz para manejar tratamientos en el formulario
interface TratamientoForm {
  tratamiento: Tratamiento | null;
  costo_final: number;
}

@Component({
  selector: 'app-registrocitas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    FloatLabelModule,
    ToastModule,
    InputNumberModule
  ],
  templateUrl: './registrocitas.html',
  styleUrl: './registrocitas.css',
  providers: [MessageService]
})
export class Registrocitas implements OnInit {

  // Datos del formulario
  citaForm: Cita = new Cita();
  tratamientosForm: TratamientoForm[] = [];

  // Listas para los selects
  pacientesActivos: Paciente[] = [];
  tratamientosActivos: Tratamiento[] = [];
  
  // Configuración
  minDate: Date = new Date(); // No permitir fechas pasadas
  
  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private pacienteService: PacienteService,
    private tratamientoService: TratamientoService,
    private estadoCitaService: EstadoCitaService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarPacientes();
    this.cargarTratamientos();
  }

  inicializarFormulario(): void {
    this.citaForm = new Cita();
    this.citaForm.fecha_cita = new Date();
    this.citaForm.hora_cita = '';
    this.citaForm.descripcion = '';
    this.citaForm.recordatorioEnviado = false;
    this.citaForm.estado = 'Activo';
    
    // EstadoCita "Pendiente" con id = 1
    this.citaForm.estadoCita = { id: 1, nombre: 'Pendiente', estado: 'Activo' };
    
    // Usuario con id = 1 (por defecto)
    this.citaForm.usuario = { id: 1 };
    
    // Limpiar tratamientos y agregar uno vacío por defecto
    if (this.tratamientosForm.length === 0) {
      this.agregarTratamiento();
    }
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (data) => {
        this.pacientesActivos = data.filter(p => p.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.showToast('error', 'Error', 'No se pudieron cargar los pacientes');
      }
    });
  }

  cargarTratamientos(): void {
    this.tratamientoService.getTratamientos().subscribe({
      next: (data) => {
        this.tratamientosActivos = data.filter(t => t.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tratamientos:', error);
        this.showToast('error', 'Error', 'No se pudieron cargar los tratamientos');
      }
    });
  }

  agregarTratamiento(): void {
    const maxTratamientos = 10;
    
    if (this.tratamientosForm.length >= maxTratamientos) {
      this.showToast('warn', 'Límite alcanzado', `Solo puede agregar hasta ${maxTratamientos} tratamientos por cita`);
      return;
    }

    this.tratamientosForm.push({
      tratamiento: null,
      costo_final: 0
    });
    
    this.cdr.detectChanges();
  }

  eliminarTratamiento(index: number): void {
    if (this.tratamientosForm.length > 1) {
      this.tratamientosForm.splice(index, 1);
      this.cdr.detectChanges();
    } else {
      this.showToast('warn', 'Advertencia', 'Debe haber al menos un tratamiento');
    }
  }

  onTratamientoChange(index: number): void {
    const tratamientoForm = this.tratamientosForm[index];
    if (tratamientoForm.tratamiento) {
      // Asignar el costo base del tratamiento como costo final por defecto
      tratamientoForm.costo_final = tratamientoForm.tratamiento.costo_base;
      this.cdr.detectChanges();
    }
  }

  validarFormulario(): boolean {
    // Validar datos básicos de la cita
    if (!this.citaForm.fecha_cita) {
      this.showToast('warn', 'Validación', 'Debe seleccionar una fecha');
      return false;
    }

    if (!this.citaForm.hora_cita) {
      this.showToast('warn', 'Validación', 'Debe ingresar una hora');
      return false;
    }

    if (!this.citaForm.paciente) {
      this.showToast('warn', 'Validación', 'Debe seleccionar un paciente');
      return false;
    }

    // Validar tratamientos
    if (this.tratamientosForm.length === 0) {
      this.showToast('warn', 'Validación', 'Debe agregar al menos un tratamiento');
      return false;
    }

    for (let i = 0; i < this.tratamientosForm.length; i++) {
      const tf = this.tratamientosForm[i];
      
      if (!tf.tratamiento) {
        this.showToast('warn', 'Validación', `Debe seleccionar el tratamiento ${i + 1}`);
        return false;
      }

      if (tf.costo_final <= 0) {
        this.showToast('warn', 'Validación', `El costo del tratamiento ${i + 1} debe ser mayor a 0`);
        return false;
      }
    }

    // Validar que no haya tratamientos duplicados
    const tratamientosIds = this.tratamientosForm.map(tf => tf.tratamiento?.id);
    const duplicados = tratamientosIds.filter((id, index) => tratamientosIds.indexOf(id) !== index);
    
    if (duplicados.length > 0) {
      this.showToast('warn', 'Validación', 'No puede agregar el mismo tratamiento más de una vez');
      return false;
    }

    return true;
  }

  registrarCita(): void {
    if (!this.validarFormulario()) {
      return;
    }

    // Preparar la cita para enviar al backend
    const citaParaEnviar = this.prepararCitaParaBackend();

    // Crear la cita
    this.citaService.createCita(citaParaEnviar).subscribe({
      next: (citaCreada) => {
        console.log('Cita creada:', citaCreada);
        
        // Crear los tratamientos asociados
        this.crearTratamientosCita(citaCreada);
      },
      error: (error) => {
        console.error('Error al crear cita:', error);
        this.showToast('error', 'Error', 'No se pudo registrar la cita');
      }
    });
  }

  prepararCitaParaBackend(): any {
    // Convertir la fecha a formato yyyy-MM-dd para el backend
    const fechaFormateada = this.citaForm.fecha_cita 
      ? this.formatearFecha(this.citaForm.fecha_cita)
      : null;

    return {
      ...this.citaForm,
      fecha_cita: fechaFormateada
    };
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  crearTratamientosCita(cita: Cita): void {
    const promesas = this.tratamientosForm.map(tf => {
      // Preparar el objeto para enviar al backend con solo los IDs
      const citaTratamientoParaEnviar = {
        cita: { id: cita.id },
        tratamiento: { id: tf.tratamiento?.id },
        costo_final: tf.costo_final,
        estado: 'Activo'
      };

      console.log('Enviando citaTratamiento:', citaTratamientoParaEnviar);

      return this.citaTratamientoService.createCitaTratamiento(citaTratamientoParaEnviar as any).toPromise();
    });

    Promise.all(promesas)
      .then(() => {
        this.showToast('success', 'Éxito', 'Cita registrada correctamente');
        // Limpiar el formulario después de registrar
        setTimeout(() => {
          this.limpiarFormulario();
        }, 1500);
      })
      .catch((error) => {
        console.error('Error al crear tratamientos:', error);
        console.error('Detalles del error:', error);
        this.showToast('error', 'Error', 'La cita se creó pero hubo un error al agregar los tratamientos: ' + (error?.error?.message || error?.message || 'Error desconocido'));
      });
  }

  limpiarFormulario(): void {
    // Reinicializar el formulario
    this.tratamientosForm = [];
    this.inicializarFormulario();
    this.cdr.detectChanges();
  }

  cancelar(): void {
    this.limpiarFormulario();
  }

  calcularTotal(): number {
    return this.tratamientosForm.reduce((total, tf) => total + (tf.costo_final || 0), 0);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
