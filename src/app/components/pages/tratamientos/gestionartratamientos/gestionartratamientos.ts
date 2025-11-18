import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Tratamiento, EstadoTratamiento } from '../../../../models/tratamiento';
import { Doctor } from '../../../../models/doctor';
import { TratamientoService } from '../../../../services/tratamiento-service';
import { DoctorService } from '../../../../services/doctor-service';

// --- Importaciones de PrimeNG (¡¡CORREGIDAS A TU VERSIÓN V20!!) ---
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // <-- ¡Tu import correcto!
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select'; // <-- ¡Tu import correcto!
import { FloatLabelModule } from 'primeng/floatlabel'; // Lo dejamos para los <input>
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToolbarModule } from 'primeng/toolbar';


@Component({
  selector: 'app-gestion-tratamientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    InputTextModule,
    TextareaModule,     // <-- ¡CORREGIDO!
    InputNumberModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,       // <-- ¡CORREGIDO!
    RadioButtonModule,
    ToolbarModule,
    FloatLabelModule,
    CardModule
  ],
  templateUrl: './gestionartratamientos.html',
  styleUrls: ['./gestionartratamientos.css'],
  providers: [MessageService, ConfirmationService] 
})
export class GestionarTratamientos implements OnInit {

  // --- Listas de datos ---
  public publicTratamientos: Tratamiento[] = [];
  public doctoresDisponibles: Doctor[] = [];

  // --- Estados de diálogos ---
  public displayAccionesDialog: boolean = false;
  public displayFormDialog: boolean = false;

  // --- Modelos de datos para formularios ---
  public selectedTratamiento: Tratamiento | null = null;
  public tratamientoParaForm: Tratamiento = new Tratamiento();
  public esNuevoTratamiento: boolean = false;
  @ViewChild('tratamientoForm') public tratamientoForm!: NgForm;

  constructor(
    private tratamientoService: TratamientoService,
    private doctorService: DoctorService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.publicTratamientos = [];
    this.doctoresDisponibles = [];
    this.cargarTratamientos();
    this.cargarDoctores();
  }

  // --- LÓGICA DE CARGA DE DATOS ---

  public cargarTratamientos(): void {
    this.tratamientoService.getTratamientos().subscribe({
      next: (data) => {
        console.log('Tratamientos cargados:', data);
        this.publicTratamientos = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error completo al cargar tratamientos:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        
        let errorMsg = 'No se pudo cargar los tratamientos';
        if (error.error && error.error.message) {
          errorMsg += `: ${error.error.message}`;
        } else if (error.message) {
          errorMsg += `: ${error.message}`;
        }
        
        this.showToast('error', 'Error del Servidor', errorMsg);
        this.publicTratamientos = [];
        this.cdr.detectChanges();
      }
    });
  }

  public cargarDoctores(): void {
    this.doctorService.getDoctores().subscribe({
      next: (data) => {
        console.log('Doctores recibidos:', data);
        this.doctoresDisponibles = data.filter(d => d.estado === 'Activo');
        console.log('Doctores disponibles (activos):', this.doctoresDisponibles);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar doctores:', error);
        this.showToast('error', 'Error', 'No se pudo cargar los doctores');
      }
    });
  }

  // --- MANEJO DE DIÁLOGOS Y ACCIONES DE TABLA ---

  public onRowSelect(event: any): void {
    this.selectedTratamiento = event.data;
    this.displayAccionesDialog = true;
  }

  public abrirDialogNuevo(): void {
    this.tratamientoParaForm = new Tratamiento(); 
    this.tratamientoParaForm.estado = 'Activo'; 
    this.esNuevoTratamiento = true;
    this.displayFormDialog = true;
  }

  public abrirDialogEditar(): void {
    if (!this.selectedTratamiento) return;

    this.tratamientoParaForm = { ...this.selectedTratamiento };

    if (this.tratamientoParaForm.doctor) {
      this.tratamientoParaForm.doctor = this.doctoresDisponibles.find(d => d.id === this.tratamientoParaForm.doctor!.id) || null;
    }
    
    this.esNuevoTratamiento = false;
    this.displayAccionesDialog = false; 
    this.displayFormDialog = true; 
  }

  public confirmarCambioEstado(): void {
    if (!this.selectedTratamiento) return;

    const idTratamiento = this.selectedTratamiento.id!;
    const nuevoEstado: EstadoTratamiento = this.selectedTratamiento.estado === 'Activo' ? 'Inactivo' : 'Activo';
    
    const tratamientoActualizado: Tratamiento = { 
      ...this.selectedTratamiento, 
      estado: nuevoEstado 
    };

    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado a ${nuevoEstado}?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.tratamientoService.updateTratamiento(idTratamiento, tratamientoActualizado).subscribe({
          next: () => {
            this.showToast('success', 'Actualizado', `Tratamiento ahora está ${nuevoEstado}`);
            this.cargarTratamientos();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  public confirmarEliminar(): void {
    if (!this.selectedTratamiento) return;

    const idTratamiento = this.selectedTratamiento.id!;

    this.confirmationService.confirm({
      message: '¿Está seguro de ELIMINAR PERMANENTEMENTE este tratamiento?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.tratamientoService.deleteTratamiento(idTratamiento).subscribe({
          next: () => {
            this.showToast('success', 'Eliminado', 'Tratamiento eliminado permanentemente');
            this.cargarTratamientos();
            this.displayAccionesDialog = false;
          },
          error: () => this.showToast('error', 'Error', 'No se pudo eliminar el tratamiento')
        });
      }
    });
  }

  // --- ACCIONES DEL DIÁLOGO DE FORMULARIO ---

  public guardarTratamiento(): void {
    if (!this.tratamientoForm.form.valid) {
      this.showToast('warn', 'Formulario Inválido', 'Revise los campos requeridos');
      return;
    }

    if (this.esNuevoTratamiento) {
      // --- CREAR ---
      this.tratamientoService.createTratamiento(this.tratamientoParaForm).subscribe({
        next: () => {
          this.showToast('success', 'Registrado', 'Tratamiento creado con éxito');
          this.cargarTratamientos();
          this.displayFormDialog = false;
        },
        error: () => this.showToast('error', 'Error', 'No se pudo crear el tratamiento')
      });

    } else {
      // --- ACTUALIZAR ---
      const idTratamiento = this.tratamientoParaForm.id!;
      this.tratamientoService.updateTratamiento(idTratamiento, this.tratamientoParaForm).subscribe({
        next: () => {
          this.showToast('success', 'Actualizado', 'Tratamiento actualizado con éxito');
          this.cargarTratamientos();
          this.displayFormDialog = false;
        },
        error: () => this.showToast('error', 'Error', 'No se pudo actualizar el tratamiento')
      });
    }
  }

  // --- UTILITARIOS ---

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  public getSeverityForEstado(estado: EstadoTratamiento): 'success' | 'danger' {
    return estado === 'Activo' ? 'success' : 'danger';
  }

  public onAccionesDialogHide(): void {
    this.selectedTratamiento = null;
  }
}