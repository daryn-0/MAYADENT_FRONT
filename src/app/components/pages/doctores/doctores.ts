import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Doctor, EstadoDoctor } from '../../../models/doctor';
import { DoctorService } from '../../../services/doctor-service';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-doctores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    CardModule,
    RadioButtonModule
  ],
  templateUrl: './doctores.html',
  styleUrl: './doctores.css',
  providers: [MessageService, ConfirmationService] 
})
export class Doctores implements OnInit {
  // Para resetear el formulario
  @ViewChild('doctorForm') doctorForm?: NgForm;

  // --- Estado de la Vista ---
  doctores: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  doctorParaForm: Doctor = new Doctor(); // Para el formulario de 'Añadir' o 'Editar'
  
  // --- Control de Diálogos ---
  displayAccionesDialog: boolean = false;
  displayFormDialog: boolean = false;
  esNuevoDoctor: boolean = true;

  constructor(
    private doctorService: DoctorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.doctores = [];
    this.cargarDoctores();
  }

  cargarDoctores(): void {
    this.doctorService.getDoctores().subscribe({
      next: (data) => {
        this.doctores = data;
        this.cdr.detectChanges();
      },
      error: (err) => this.showToast('error', 'Error', 'No se pudieron cargar los doctores')
    });
  }

  // --- ACCIONES DE LA VISTA ---

  /** Se dispara al hacer clic en el botón "Añadir Doctor" */
  abrirDialogNuevo(): void {
    // Usamos el constructor por defecto que pone 'Activo'
    this.doctorParaForm = new Doctor(); 
    this.esNuevoDoctor = true;
    this.doctorForm?.resetForm(this.doctorParaForm); // Limpia validaciones
    this.displayFormDialog = true;
  }

  /** Se dispara al seleccionar una fila de la tabla */
  onRowSelect(event: any): void {
    // event.data contiene el objeto Doctor seleccionado
    this.selectedDoctor = event.data;
    this.displayAccionesDialog = true;
  }

  /** Se dispara al CERRAR el diálogo de acciones */
  onAccionesDialogHide(): void {
    this.selectedDoctor = null; // Limpia la selección de la tabla
  }

  // --- ACCIONES DEL DIÁLOGO DE ACCIONES ---

  /** Se dispara desde el diálogo de acciones */
  abrirDialogEditar(): void {
    if (!this.selectedDoctor) return;
    
    // Clonamos el objeto para editarlo sin afectar la tabla
    this.doctorParaForm = { ...this.selectedDoctor }; 
    this.esNuevoDoctor = false;
    this.displayFormDialog = true;
    this.displayAccionesDialog = false; // Cerramos el diálogo de acciones
  }

  /** Se dispara desde el diálogo de acciones */
  confirmarCambioEstado(): void {
    if (!this.selectedDoctor) return;

    const idDoctor = this.selectedDoctor.id!;
    const estadoActual = this.selectedDoctor.estado;
    const nuevoEstado: EstadoDoctor = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    
    const doctorActualizado: Doctor = { 
      ...this.selectedDoctor, 
      estado: nuevoEstado 
    };

    this.confirmationService.confirm({
      message: `¿Seguro que deseas cambiar el estado de "${this.selectedDoctor.nombre}" a "${nuevoEstado}"?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.doctorService.updateDoctor(idDoctor, doctorActualizado).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', 'Estado del doctor actualizado');
            this.cargarDoctores();
            this.displayAccionesDialog = false;
          },
          error: (err) => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  /** Se dispara desde el diálogo de acciones */
  confirmarEliminar(): void {
    if (!this.selectedDoctor) return;

    const idDoctor = this.selectedDoctor.id!;

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar permanentemente a "${this.selectedDoctor.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      acceptButtonStyleClass: 'p-button-danger', 
      accept: () => {
        this.doctorService.deleteDoctor(idDoctor).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Doctor eliminado permanentemente');
            this.cargarDoctores();
            this.displayAccionesDialog = false;
          },
          error: (err) => this.showToast('error', 'Error', 'No se pudo eliminar al doctor')
        });
      }
    });
  }


  // --- ACCIONES DEL DIÁLOGO DE FORMULARIO ---

  /** Se dispara al guardar desde el formulario (Añadir o Editar) */
  guardarDoctor(): void {
    // Validación simple
    if (!this.doctorParaForm.nombre || !this.doctorParaForm.apellido || !this.doctorParaForm.telefono) {
      this.showToast('warn', 'Datos incompletos', 'Nombre, Apellido y Teléfono son obligatorios');
      return;
    }

    if (this.esNuevoDoctor) {
      // --- Lógica para CREAR ---
      // El estado 'Activo' ya viene por defecto del constructor
      this.doctorService.createDoctor(this.doctorParaForm).subscribe({
        next: () => {
          this.showToast('success', 'Registrado', 'Nuevo doctor registrado');
          this.cargarDoctores();
          this.displayFormDialog = false;
        },
        error: (err) => this.showToast('error', 'Error', 'No se pudo registrar al doctor')
      });

    } else {
      // --- Lógica para EDITAR ---
      if (!this.doctorParaForm.id) return; // Seguridad
      
      this.doctorService.updateDoctor(this.doctorParaForm.id, this.doctorParaForm).subscribe({
        next: () => {
          this.showToast('success', 'Actualizado', 'Datos del doctor actualizados');
          this.cargarDoctores();
          this.displayFormDialog = false;
        },
        error: (err) => this.showToast('error', 'Error', 'No se pudieron actualizar los datos')
      });
    }
  }


  // --- Utilidad ---
  showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  /** Devuelve el 'severity' (color) para el p-tag según el estado */
  getSeverityForEstado(estado: EstadoDoctor): 'success' | 'danger' {
    return estado === 'Activo' ? 'success' : 'danger';
  }
}
