import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // Para ngModel y ngForm
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Paciente, Estado, Genero } from '../../../../models/paciente';
import { PacienteService } from '../../../../services/paciente-service';

@Component({
  selector: 'app-gestionarpacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    DatePickerModule,
    RadioButtonModule,
    TableModule, // <-- Añadido para la tabla
    TagModule,
    FloatLabel
  ],
  templateUrl: './gestionarpacientes.html',
  styleUrl: './gestionarpacientes.css',
  providers: [MessageService, ConfirmationService]
})
export class Gestionarpacientes implements OnInit {
  // --- Búsqueda por DNI (Funcionalidad existente) ---
  public dniABuscar: string = '';
  public pacienteEncontrado: Paciente | null = null;

  // --- Diálogo de Edición (Funcionalidad existente) ---
  public pacienteParaEditar: Paciente = new Paciente();
  public displayEditDialog: boolean = false;
  public generos = [{ label: 'Masculino', value: 'Masculino' }, { label: 'Femenino', value: 'Femenino' }];
  @ViewChild('editForm') public editForm!: NgForm;

  // --- NUEVA TABLA DE RESUMEN ---
  public listaTodosPacientes: Paciente[] = [];

  constructor(
    private pacienteService: PacienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    // Al iniciar, cargar la lista de pacientes para la tabla de resumen
    this.cargarTodosPacientes();
  }

  // --- NUEVA LÓGICA PARA LA TABLA DE RESUMEN ---

  /**
   * Carga todos los pacientes (activos e inactivos) en la tabla de resumen.
   */
  public cargarTodosPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (pacientes) => {
        this.listaTodosPacientes = pacientes;
      },
      error: (err) => {
        this.showToast('error', 'Error de Carga', 'No se pudo cargar la lista de pacientes');
        console.error(err);
      }
    });
  }

  /**
   * Devuelve el color (severidad) para el Tag de estado en la tabla.
   */
  public getSeverityForEstado(estado: Estado): 'success' | 'danger' {
    return estado === 'Activo' ? 'success' : 'danger';
  }


  // --- LÓGICA EXISTENTE DE BÚSQUEDA Y ACCIONES ---

  /**
   * Busca un paciente por DNI.
   */
  public buscarPorDni(): void {
    if (this.dniABuscar.length !== 8) {
      this.showToast('warn', 'DNI Inválido', 'El DNI debe tener 8 dígitos');
      return;
    }
    this.pacienteService.getPacienteByDni(this.dniABuscar).subscribe({
      next: (paciente) => {
        this.pacienteEncontrado = paciente;
        this.showToast('success', 'Encontrado', `Paciente: ${paciente.nombre} ${paciente.apellido}`);
      },
      error: (err) => {
        this.showToast('error', 'No Encontrado', 'No se encontró ningún paciente con ese DNI');
        this.pacienteEncontrado = null;
      }
    });
  }

  /**
   * Abre el diálogo de edición.
   */
  public abrirDialogEditar(): void {
    if (!this.pacienteEncontrado) return;
    
    // Convertir fecha de string (del JSON) a objeto Date (para el DatePicker)
    this.pacienteParaEditar = {
      ...this.pacienteEncontrado,
      fecha_nacimiento: new Date(this.pacienteEncontrado.fecha_nacimiento)
    };
    
    this.displayEditDialog = true;
  }

  /**
   * Guarda los cambios del formulario de edición (con validación de DNI).
   */
  public guardarCambios(): void {
    if (!this.editForm.form.valid || !this.pacienteParaEditar) {
      this.showToast('warn', 'Formulario Inválido', 'Revise los campos requeridos');
      return;
    }

    const dniOriginal = this.pacienteEncontrado!.dni;
    const dniEditado = this.pacienteParaEditar.dni;

    if (dniOriginal !== dniEditado) {
      // Si el DNI cambió, verificar que el nuevo DNI no exista
      this.pacienteService.getPacienteByDni(dniEditado).subscribe({
        next: (pacienteExistente) => {
          this.showToast('error', 'DNI Duplicado', `El DNI ${dniEditado} ya pertenece a ${pacienteExistente.nombre}`);
        },
        error: (err) => {
          // Si da error 404 (No encontrado), el DNI está libre. Proceder a actualizar.
          this.procederConLaActualizacion();
        }
      });
    } else {
      // Si el DNI no cambió, proceder a actualizar directamente.
      this.procederConLaActualizacion();
    }
  }

  /**
   * Lógica de actualización (separada para reutilizar).
   */
  private procederConLaActualizacion(): void {
    // Formatear la fecha a YYYY-MM-DD antes de enviar al backend
    const pacienteAEnviar: Paciente = {
      ...this.pacienteParaEditar,
      fecha_nacimiento: new Date(this.pacienteParaEditar.fecha_nacimiento).toISOString().split('T')[0] as any
    };

    this.pacienteService.updatePaciente(pacienteAEnviar.id!, pacienteAEnviar).subscribe({
      next: (response) => {
        this.showToast('success', 'Actualizado', 'Paciente actualizado con éxito');
        this.displayEditDialog = false;
        this.resetBusqueda(); // Limpiar la búsqueda
        this.cargarTodosPacientes(); // <-- ACTUALIZAR LA TABLA DE RESUMEN
      },
      error: (err) => {
        this.showToast('error', 'Error', 'No se pudo actualizar el paciente');
      }
    });
  }

  /**
   * Cambia el estado del paciente (Activo/Inactivo).
   */
  public cambiarEstado(): void {
    if (!this.pacienteEncontrado) return;

    const idPaciente = this.pacienteEncontrado.id!;
    const nuevoEstado: Estado = this.pacienteEncontrado.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const pacienteActualizado: Paciente = {
      ...this.pacienteEncontrado,
      estado: nuevoEstado
    };

    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado a ${nuevoEstado}?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.pacienteService.updatePaciente(idPaciente, pacienteActualizado).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', `Paciente ahora está ${nuevoEstado}`);
            this.resetBusqueda();
            this.cargarTodosPacientes(); // <-- ACTUALIZAR LA TABLA DE RESUMEN
          },
          error: (err) => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  /**
   * Borra permanentemente al paciente.
   */
  public borrarPaciente(): void {
    if (!this.pacienteEncontrado) return;

    const idPaciente = this.pacienteEncontrado.id!;

    this.confirmationService.confirm({
      message: '¿Está seguro de ELIMINAR PERMANENTEMENTE a este paciente? Esta acción no se puede deshacer.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.pacienteService.deletePaciente(idPaciente).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Paciente eliminado permanentemente');
            this.resetBusqueda();
            this.cargarTodosPacientes(); // <-- ACTUALIZAR LA TABLA DE RESUMEN
          },
          error: (err) => this.showToast('error', 'Error', 'No se pudo eliminar al paciente')
        });
      }
    });
  }

  /**
   * Limpia la búsqueda y los resultados.
   */
  public resetBusqueda(): void {
    this.dniABuscar = '';
    this.pacienteEncontrado = null;
  }

  /**
   * Muestra un toast (notificación).
   */
  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}

