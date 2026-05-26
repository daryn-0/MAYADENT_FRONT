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
    const maxTratamientos = 3;
    
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
      this.showToast('warn', 'Advertencia', 'Una cita debe tener al menos un tratamiento');
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

  validarDisponibilidadHorario(callback: (disponible: boolean) => void): void {
    if (!this.citaForm.fecha_cita || !this.citaForm.hora_cita) {
      callback(true);
      return;
    }

    // Obtener todas las citas
    this.citaService.getCitas().subscribe({
      next: (citas) => {
        // Validar que citas no sea null o undefined
        if (!citas || !Array.isArray(citas)) {
          console.warn('No se recibieron citas o el formato es incorrecto');
          callback(true); // Permitir continuar si no hay citas
          return;
        }

        const fechaCita = this.formatearFecha(this.citaForm.fecha_cita);
        const horaCita = this.citaForm.hora_cita;

        // Filtrar citas del mismo día
        const citasMismoDia = citas.filter(c => {
          const fechaCitaExistente = typeof c.fecha_cita === 'string' 
            ? c.fecha_cita 
            : this.formatearFecha(c.fecha_cita);
          return fechaCitaExistente === fechaCita && c.estado === 'Activo';
        });

        // Verificar conflictos de horario
        const conflicto = citasMismoDia.some(c => {
          const diferenciaMinutos = this.calcularDiferenciaMinutos(horaCita, c.hora_cita);
          return Math.abs(diferenciaMinutos) < 30; // Menos de 30 minutos de diferencia
        });

        if (conflicto) {
          this.showToast('warn', 'Horario No Disponible', 
            'Ya existe una cita en ese horario. Debe haber al menos 30 minutos de diferencia entre citas.');
          callback(false);
        } else {
          callback(true);
        }
      },
      error: (error) => {
        console.error('Error al validar horario:', error);
        // En caso de error, permitir continuar
        callback(true);
      }
    });
  }

  calcularDiferenciaMinutos(hora1: string, hora2: string): number {
    const [h1, m1] = hora1.split(':').map(Number);
    const [h2, m2] = hora2.split(':').map(Number);
    
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    
    return minutos1 - minutos2;
  }

  registrarCita(): void {
    if (!this.validarFormulario()) {
      return;
    }

    // Validar disponibilidad de horario antes de crear la cita
    this.validarDisponibilidadHorario((disponible) => {
      if (!disponible) {
        return;
      }

      // Preparar la cita para enviar al backend
      const citaParaEnviar = this.prepararCitaParaBackend();

      // Crear la cita
      this.citaService.createCita(citaParaEnviar).subscribe({
        next: (citaCreada) => {
          console.log('Cita creada:', citaCreada);
          
          // Verificar si se envió correo (ajustar según respuesta del backend)
          this.mostrarNotificacionCorreo('registro', citaCreada.paciente?.correo || '');
          
          // Crear los tratamientos asociados
          this.crearTratamientosCita(citaCreada);
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          this.showToast('error', 'Error', 'No se pudo registrar la cita');
        }
      });
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

  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
        
        // Mostrar notificación de correo enviado
        this.mostrarNotificacionCorreo('registro', cita.paciente?.correo || '');
        
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

  mostrarNotificacionCorreo(tipo: 'registro' | 'confirmacion', emailPaciente: string): void {
    const mensajes = {
      registro: {
        titulo: '📧 Correo Enviado',
        mensaje: `Se envió la notificación de nueva cita a: ${emailPaciente}`
      },
      confirmacion: {
        titulo: '📧 Confirmación Enviada', 
        mensaje: `Se envió la confirmación de cita a: ${emailPaciente}`
      }
    };

    const config = mensajes[tipo];
    
    // Mostrar toast de éxito para el correo
    setTimeout(() => {
      this.showToast('info', config.titulo, config.mensaje);
    }, 1000); // Delay para que se vea después del toast principal
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
