import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

// Modelos
import { Cita } from '../../../../models/cita';
import { CitaTratamiento } from '../../../../models/cita_tratamiento';
import { Paciente } from '../../../../models/paciente';
import { Tratamiento } from '../../../../models/tratamiento';
import { EstadoCita } from '../../../../models/estado_cita';
import { Doctor } from '../../../../models/doctor';

// Servicios
import { CitaService } from '../../../../services/cita-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';
import { PacienteService } from '../../../../services/paciente-service';
import { TratamientoService } from '../../../../services/tratamiento-service';
import { EstadoCitaService } from '../../../../services/estado-cita-service';
import { DoctorService } from '../../../../services/doctor-service';
import { HistorialClinicoService } from '../../../../services/historial-clinico-service';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-gestionarcitas',
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
    ConfirmDialogModule,
    ToolbarModule,
    DatePickerModule,
    SelectModule,
    FloatLabelModule,
    InputNumberModule
  ],
  templateUrl: './gestionarcitas.html',
  styleUrl: './gestionarcitas.css',
  providers: [MessageService, ConfirmationService]
})
export class Gestionarcitas implements OnInit {

  // Listas de datos
  todasLasCitas: Cita[] = []; // Todas las citas sin filtrar
  citasFiltradas: Cita[] = []; // Citas filtradas por estado
  pacientesActivos: Paciente[] = [];
  tratamientosActivos: Tratamiento[] = [];
  estadosCita: EstadoCita[] = [];
  doctoresDisponibles: Doctor[] = [];

  // Filtro de estado de cita
  filtroEstadoCita: string = 'todas';
  opcionesFiltroEstado = [
    { label: 'Todas las Citas', value: 'todas' },
    { label: 'Solo Activas', value: 'activo' },
    { label: 'Solo Inactivas', value: 'inactivo' }
  ];
  filtroDoctor: string = 'todos';
  opcionesFiltroDoctor = [
    { label: 'Todos los Doctores', value: 'todos' }
  ];

  // Estados de diálogos
  displayAccionesDialog: boolean = false;
  displayFormDialog: boolean = false;

  // Diálogo para cambiar estado de cita
  displayCambiarEstadoCitaDialog: boolean = false;
  estadoCitaSeleccionado: EstadoCita | null = null;
  citaParaCambiarEstado: Cita | null = null;

  // Diálogo para gestionar tratamientos
  displayTratamientosDialog: boolean = false;
  tratamientosCita: CitaTratamiento[] = [];
  nuevoTratamiento: Tratamiento | null = null;
  nuevoCosto: number = 0;
  citaParaTratamientos: Cita | null = null;

  // Modelos
  selectedCita: Cita | null = null;
  citaParaForm: Cita = new Cita();
  esNuevaCita: boolean = false;
  
  @ViewChild('citaForm') citaForm!: NgForm;

  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private pacienteService: PacienteService,
    private tratamientoService: TratamientoService,
    private estadoCitaService: EstadoCitaService,
    private doctorService: DoctorService,
    private historialClinicoService: HistorialClinicoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.todasLasCitas = [];
    this.citasFiltradas = [];
    this.cargarCitas();
    this.cargarPacientes();
    this.cargarTratamientos();
    this.cargarEstadosCita();
    this.cargarDoctores();
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        // Validar que data no sea null o undefined
        if (!data || !Array.isArray(data)) {
          console.warn('No se recibieron citas o el formato es incorrecto');
          this.todasLasCitas = [];
          this.aplicarFiltroEstado();
          return;
        }
        
        this.todasLasCitas = data;
        this.cargarTratamientosParaCitas();
        console.log('Todas las citas cargadas:', this.todasLasCitas);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.todasLasCitas = [];
        this.citasFiltradas = [];
        this.showToast('error', 'Error', 'No se pudieron cargar las citas');
      }
    });
  }

  aplicarFiltroEstado(): void {
    let citasFiltradas = [...this.todasLasCitas];

    switch (this.filtroEstadoCita) {
      case 'activo':
        citasFiltradas = citasFiltradas.filter(c => c.estado === 'Activo');
        break;
      case 'inactivo':
        citasFiltradas = citasFiltradas.filter(c => c.estado === 'Inactivo');
        break;
      default: // 'todas'
        break;
    }

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
    this.aplicarFiltroEstado();
    this.cdr.detectChanges();
  }

  onFiltroDoctorChange(): void {
    this.aplicarFiltroEstado();
    this.cdr.detectChanges();
  }

  cargarDoctores(): void {
    this.doctorService.getDoctores().subscribe({
      next: (data) => {
        this.doctoresDisponibles = data.filter(d => d.estado === 'Activo');
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

  cargarTratamientosParaCitas(): void {
    const promesas = this.todasLasCitas.map(cita => {
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
      this.aplicarFiltroEstado();
      this.cdr.detectChanges();
    });
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

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (data) => {
        this.pacientesActivos = data.filter(p => p.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
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
      }
    });
  }

  cargarEstadosCita(): void {
    this.estadoCitaService.getEstadosCita().subscribe({
      next: (data) => {
        this.estadosCita = data.filter(e => e.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar estados de cita:', error);
      }
    });
  }

  onRowSelect(event: any): void {
    this.selectedCita = event.data;
    this.displayAccionesDialog = true;
  }

  abrirDialogEditar(): void {
    if (!this.selectedCita) return;

    this.citaParaForm = { ...this.selectedCita };
    
    // Convertir fecha string a Date si es necesario
    if (typeof this.citaParaForm.fecha_cita === 'string') {
      this.citaParaForm.fecha_cita = new Date(this.citaParaForm.fecha_cita);
    }

    this.esNuevaCita = false;
    this.displayAccionesDialog = false;
    this.displayFormDialog = true;
  }

  abrirDialogCambiarEstadoCita(): void {
    if (!this.selectedCita) return;
    
    // Guardar una copia de la cita antes de que se pierda
    this.citaParaCambiarEstado = { ...this.selectedCita };
    
    console.log('Estados disponibles:', this.estadosCita);
    console.log('Estado actual de la cita:', this.selectedCita.estadoCita);
    
    // Buscar el estado en la lista de estados disponibles
    this.estadoCitaSeleccionado = this.estadosCita.find(
      e => e.id === this.selectedCita?.estadoCita?.id
    ) || null;
    
    console.log('Estado seleccionado:', this.estadoCitaSeleccionado);
    
    this.displayAccionesDialog = false;
    this.displayCambiarEstadoCitaDialog = true;
  }

  guardarCambioEstadoCita(): void {
    console.log('guardarCambioEstadoCita llamado');
    console.log('citaParaCambiarEstado:', this.citaParaCambiarEstado);
    console.log('estadoCitaSeleccionado:', this.estadoCitaSeleccionado);

    if (!this.citaParaCambiarEstado || !this.estadoCitaSeleccionado) {
      console.log('Validación falló');
      this.showToast('warn', 'Advertencia', 'Debe seleccionar un estado');
      return;
    }

    const idCita = this.citaParaCambiarEstado.id!;
    const estadoAnterior = this.citaParaCambiarEstado.estadoCita?.nombre.toLowerCase() || '';
    const nuevoEstadoCita = this.estadoCitaSeleccionado.nombre.toLowerCase();
    const citaActualizada = {
      ...this.citaParaCambiarEstado,
      estadoCita: this.estadoCitaSeleccionado
    };

    console.log('Enviando actualización:', citaActualizada);

    this.citaService.updateCita(idCita, this.prepararCitaParaBackend(citaActualizada)).subscribe({
      next: () => {
        console.log('Actualización exitosa');
        // Verificar si se envió correo al confirmar
        if (this.estadoCitaSeleccionado?.nombre.toLowerCase() === 'confirmada') {
          this.mostrarNotificacionCorreo(this.citaParaCambiarEstado?.paciente?.correo || '');
        }

        if (estadoAnterior === 'confirmada' && nuevoEstadoCita === 'atendida') {
          this.crearHistorialClinicoPorCita(idCita);
        }
        
        this.showToast('success', 'Actualizado', `Estado de cita cambiado a ${this.estadoCitaSeleccionado?.nombre}`);
        this.cargarCitas();
        this.displayCambiarEstadoCitaDialog = false;
        this.citaParaCambiarEstado = null;
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.showToast('error', 'Error', 'No se pudo actualizar el estado de la cita');
      }
    });
  }

  crearHistorialClinicoPorCita(citaId: number): void {
    this.historialClinicoService.createHistorialPorCita(citaId).subscribe({
      next: () => {
        this.showToast('success', 'Historial Clínico', 'Se creó el historial clínico de la cita atendida');
      },
      error: (error) => {
        console.error('Error al crear historial clínico:', error);
        this.showToast('warn', 'Historial Clínico', 'La cita fue atendida, pero no se pudo crear el historial clínico automáticamente');
      }
    });
  }

  confirmarCambioEstado(): void {
    if (!this.selectedCita) return;

    const idCita = this.selectedCita.id!;
    const estadoActual = this.selectedCita.estado;
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    const citaActualizada = {
      ...this.selectedCita,
      estado: nuevoEstado
    };

    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado de la cita a ${nuevoEstado}?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.citaService.updateCita(idCita, this.prepararCitaParaBackend(citaActualizada)).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', `Cita ahora está ${nuevoEstado}`);
            this.cargarCitas();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.selectedCita) return;

    const idCita = this.selectedCita.id!;

    this.confirmationService.confirm({
      message: '¿Está seguro de ELIMINAR PERMANENTEMENTE esta cita?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.citaService.deleteCita(idCita).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Cita eliminada permanentemente');
            this.cargarCitas();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo eliminar la cita')
        });
      }
    });
  }

  guardarCita(): void {
    if (!this.citaForm.form.valid) {
      this.showToast('warn', 'Formulario Inválido', 'Revise los campos requeridos');
      return;
    }

    const idCita = this.citaParaForm.id!;
    const citaParaEnviar = this.prepararCitaParaBackend(this.citaParaForm);

    this.citaService.updateCita(idCita, citaParaEnviar).subscribe({
      next: () => {
        this.showToast('success', 'Actualizado', 'Cita actualizada con éxito');
        this.cargarCitas();
        this.displayFormDialog = false;
      },
      error: () => this.showToast('error', 'Error', 'No se pudo actualizar la cita')
    });
  }

  prepararCitaParaBackend(cita: any): any {
    const fechaFormateada = cita.fecha_cita 
      ? this.formatearFecha(cita.fecha_cita)
      : null;

    return {
      ...cita,
      fecha_cita: fechaFormateada
    };
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatearFechaDisplay(fecha: Date | string): string {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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

  abrirDialogTratamientos(): void {
    if (!this.selectedCita || !this.selectedCita.id) return;
    
    this.citaParaTratamientos = this.selectedCita;
    this.displayAccionesDialog = false;
    this.cargarTratamientosCita(this.selectedCita.id);
  }

  cargarTratamientosCita(citaId: number): void {
    this.citaTratamientoService.getCitaTratamientosByCitaId(citaId).subscribe({
      next: (data) => {
        this.tratamientosCita = data;
        if (this.citaParaTratamientos) {
          this.citaParaTratamientos.tratamientos = data;
        }
        if (this.selectedCita) {
          this.selectedCita.tratamientos = data;
        }
        const citaEnLista = this.todasLasCitas.find(cita => cita.id === citaId);
        if (citaEnLista) {
          citaEnLista.tratamientos = data;
        }
        this.aplicarFiltroEstado();
        this.displayTratamientosDialog = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar tratamientos:', error);
        this.showToast('error', 'Error', 'No se pudieron cargar los tratamientos de la cita');
      }
    });
  }

  agregarTratamientoCita(): void {
    const maxTratamientos = 3;

    if (!this.nuevoTratamiento || this.nuevoCosto <= 0) {
      this.showToast('warn', 'Validación', 'Debe seleccionar un tratamiento y un costo válido');
      return;
    }

    if (!this.citaParaTratamientos || !this.citaParaTratamientos.id) {
      this.showToast('error', 'Error', 'No hay una cita seleccionada');
      return;
    }

    // Validar límite máximo
    if (this.tratamientosCita.length >= maxTratamientos) {
      this.showToast('warn', 'Límite alcanzado', `Solo puede agregar hasta ${maxTratamientos} tratamientos por cita`);
      return;
    }

    // Verificar que no esté duplicado
    const existe = this.tratamientosCita.some(
      ct => ct.tratamiento?.id === this.nuevoTratamiento?.id
    );

    if (existe) {
      this.showToast('warn', 'Advertencia', 'Este tratamiento ya está agregado a la cita');
      return;
    }

    // Preparar el objeto para enviar al backend con solo los IDs
    const citaTratamientoParaEnviar = {
      cita: { id: this.citaParaTratamientos.id },
      tratamiento: { id: this.nuevoTratamiento.id },
      costo_final: this.nuevoCosto,
      estado: 'Activo'
    };

    console.log('Enviando citaTratamiento:', citaTratamientoParaEnviar);

    this.citaTratamientoService.createCitaTratamiento(citaTratamientoParaEnviar as any).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.showToast('success', 'Agregado', 'Tratamiento agregado a la cita');
        if (this.citaParaTratamientos?.id) {
          this.cargarTratamientosCita(this.citaParaTratamientos.id);
        }
        this.nuevoTratamiento = null;
        this.nuevoCosto = 0;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al agregar tratamiento:', error);
        console.error('Detalles del error:', error.error);
        this.showToast('error', 'Error', 'No se pudo agregar el tratamiento: ' + (error.error?.message || error.message));
      }
    });
  }

  eliminarTratamientoCita(citaTratamiento: CitaTratamiento): void {
    if (!citaTratamiento.id) return;

    // Validar que no sea el último tratamiento
    if (this.tratamientosCita.length <= 1) {
      this.showToast('warn', 'Advertencia', 'Una cita debe tener al menos un tratamiento');
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el tratamiento "${citaTratamiento.tratamiento?.nombre}" de esta cita?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.citaTratamientoService.deleteCitaTratamiento(citaTratamiento.id!).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Tratamiento eliminado de la cita');
            if (this.citaParaTratamientos?.id) {
              this.cargarTratamientosCita(this.citaParaTratamientos.id);
            }
          },
          error: (error) => {
            console.error('Error al eliminar tratamiento:', error);
            this.showToast('error', 'Error', 'No se pudo eliminar el tratamiento');
          }
        });
      }
    });
  }

  onTratamientoSeleccionado(event: any): void {
    if (this.nuevoTratamiento) {
      this.nuevoCosto = this.nuevoTratamiento.costo_base;
      this.cdr.detectChanges();
    }
  }

  calcularTotalCita(): number {
    if (!this.tratamientosCita || this.tratamientosCita.length === 0) {
      return 0;
    }
    return this.tratamientosCita.reduce((total, ct) => total + ct.costo_final, 0);
  }

  onAccionesDialogHide(): void {
    if (!this.displayTratamientosDialog) {
      this.selectedCita = null;
    }
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  mostrarNotificacionCorreo(emailPaciente: string): void {
    const config = {
      titulo: '📧 Confirmación Enviada',
      mensaje: `Se envió la confirmación de cita a: ${emailPaciente}`
    };
    
    // Mostrar toast de éxito para el correo
    setTimeout(() => {
      this.showToast('info', config.titulo, config.mensaje);
    }, 1000); // Delay para que se vea después del toast principal
  }

  obtenerEstadosPermitidos(): EstadoCita[] {
    if (!this.citaParaCambiarEstado || !this.citaParaCambiarEstado.estadoCita) {
      return this.estadosCita;
    }

    const estadoActual = this.citaParaCambiarEstado.estadoCita.nombre.toLowerCase();
    
    // Reglas de transición de estados - FLUJO COMPLETO RECOMENDADO
    const transiciones: { [key: string]: string[] } = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['atendida', 'cancelada', 'no asistió'],
      'atendida': [], // Estado final - no puede cambiar
      'cancelada': [], // Estado final - no puede cambiar  
      'no asistió': [] // Estado final - no puede cambiar
    };

    const estadosPermitidos = transiciones[estadoActual] || [];
    
    // Si no hay estados permitidos, retornar array vacío
    if (estadosPermitidos.length === 0) {
      return [];
    }

    // Filtrar los estados disponibles según las reglas
    return this.estadosCita.filter(e => 
      estadosPermitidos.includes(e.nombre.toLowerCase())
    );
  }

  onTratamientosDialogHide(): void {
    this.citaParaTratamientos = null;
    this.nuevoTratamiento = null;
    this.nuevoCosto = 0;
    this.tratamientosCita = [];
  }
}
