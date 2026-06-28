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
import { Inventario } from '../../../../models/inventario';
import { UsoInsumo } from '../../../../models/uso_insumo';
import { Factura } from '../../../../models/factura';
import { DetalleFactura } from '../../../../models/detalle_factura';
import { EstadoPago } from '../../../../models/estado_pago';
import { MetodoPago } from '../../../../models/metodo_pago';

// Servicios
import { CitaService } from '../../../../services/cita-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';
import { PacienteService } from '../../../../services/paciente-service';
import { TratamientoService } from '../../../../services/tratamiento-service';
import { EstadoCitaService } from '../../../../services/estado-cita-service';
import { DoctorService } from '../../../../services/doctor-service';
import { HistorialClinicoService } from '../../../../services/historial-clinico-service';
import { InventarioService } from '../../../../services/inventario-service';
import { UsoInsumoService } from '../../../../services/uso-insumo-service';
import { FacturaService } from '../../../../services/factura-service';
import { EstadoPagoService } from '../../../../services/estado-pago-service';
import { MetodoPagoService } from '../../../../services/metodo-pago-service';

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
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-gestionarcitas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CardModule, TableModule, ButtonModule,
    InputTextModule, TagModule, ToastModule, DialogModule, ConfirmDialogModule,
    ToolbarModule, DatePickerModule, SelectModule, FloatLabelModule,
    InputNumberModule, TooltipModule
  ],
  templateUrl: './gestionarcitas.html',
  styleUrl: './gestionarcitas.css',
  providers: [MessageService, ConfirmationService]
})
export class Gestionarcitas implements OnInit {

  // Listas
  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  pacientesActivos: Paciente[] = [];
  tratamientosActivos: Tratamiento[] = [];
  estadosCita: EstadoCita[] = [];
  doctoresDisponibles: Doctor[] = [];
  productosInventario: Inventario[] = [];
  estadosPago: EstadoPago[] = [];
  metodosPago: MetodoPago[] = [];

  // Filtros
  filtroEstadoCita: string = 'todas';
  opcionesFiltroEstado = [
    { label: 'Todas las Citas', value: 'todas' },
    { label: 'Solo Activas', value: 'activo' },
    { label: 'Solo Inactivas', value: 'inactivo' }
  ];
  filtroDoctor: string = 'todos';
  opcionesFiltroDoctor = [{ label: 'Todos los Doctores', value: 'todos' }];

  // Dialogs
  displayAccionesDialog = false;
  displayFormDialog = false;
  displayCambiarEstadoCitaDialog = false;
  displayConfirmarAtendidaDialog = false;
  displayTratamientosDialog = false;
  displayInsumosDialog = false;
  displayFacturaDialog = false;

  // Estado cita
  estadoCitaSeleccionado: EstadoCita | null = null;
  citaParaCambiarEstado: Cita | null = null;

  // Tratamientos
  tratamientosCita: CitaTratamiento[] = [];
  nuevoTratamiento: Tratamiento | null = null;
  nuevoCosto: number = 0;
  citaParaTratamientos: Cita | null = null;

  // Insumos
  usoInsumos: UsoInsumo[] = [];
  nuevoProducto: Inventario | null = null;
  nuevaCantidadInsumo: number = 1;
  costoNuevoInsumo: number = 0;
  citaParaInsumos: Cita | null = null;

  // Factura
  facturaForm: Factura = new Factura();
  citaParaFactura: Cita | null = null;

  // Cita form
  selectedCita: Cita | null = null;
  citaParaForm: Cita = new Cita();
  esNuevaCita = false;

  @ViewChild('citaForm') citaForm!: NgForm;

  constructor(
    private citaService: CitaService,
    private citaTratamientoService: CitaTratamientoService,
    private pacienteService: PacienteService,
    private tratamientoService: TratamientoService,
    private estadoCitaService: EstadoCitaService,
    private doctorService: DoctorService,
    private historialClinicoService: HistorialClinicoService,
    private inventarioService: InventarioService,
    private usoInsumoService: UsoInsumoService,
    private facturaService: FacturaService,
    private estadoPagoService: EstadoPagoService,
    private metodoPagoService: MetodoPagoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.cargarPacientes();
    this.cargarTratamientos();
    this.cargarEstadosCita();
    this.cargarDoctores();
    this.cargarInventario();
    this.cargarEstadosPago();
    this.cargarMetodosPago();
  }

  // ── CARGA DE DATOS ──────────────────────────────────────────

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.todasLasCitas = data || [];
        this.cargarTratamientosParaCitas();
        this.cdr.detectChanges();
      },
      error: () => {
        this.todasLasCitas = [];
        this.citasFiltradas = [];
        this.showToast('error', 'Error', 'No se pudieron cargar las citas');
      }
    });
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (data) => { this.pacientesActivos = data.filter(p => p.estado === 'Activo'); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarTratamientos(): void {
    this.tratamientoService.getTratamientos().subscribe({
      next: (data) => { this.tratamientosActivos = data.filter(t => t.estado === 'Activo'); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarEstadosCita(): void {
    this.estadoCitaService.getEstadosCita().subscribe({
      next: (data) => { this.estadosCita = data.filter(e => e.estado === 'Activo'); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarDoctores(): void {
    this.doctorService.getDoctores().subscribe({
      next: (data) => {
        this.doctoresDisponibles = data.filter(d => d.estado === 'Activo');
        this.opcionesFiltroDoctor = [
          { label: 'Todos los Doctores', value: 'todos' },
          ...this.doctoresDisponibles.map(d => ({ label: `Dr. ${d.nombre} ${d.apellido}`, value: d.id?.toString() || '' }))
        ];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  cargarInventario(): void {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => { this.productosInventario = data.filter(p => p.estado === 'Activo' && p.cantidad > 0); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarEstadosPago(): void {
    this.estadoPagoService.getEstadosPago().subscribe({
      next: (data) => { this.estadosPago = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarMetodosPago(): void {
    this.metodoPagoService.getMetodosPago().subscribe({
      next: (data) => { this.metodosPago = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  cargarTratamientosParaCitas(): void {
    const promesas = this.todasLasCitas.map(cita => {
      if (!cita.id) return Promise.resolve(cita);
      return this.citaTratamientoService.getCitaTratamientosByCitaId(cita.id).toPromise()
        .then(t => { cita.tratamientos = t || []; return cita; })
        .catch(() => { cita.tratamientos = []; return cita; });
    });
    Promise.all(promesas).then(() => { this.aplicarFiltroEstado(); this.cdr.detectChanges(); });
  }

  // ── FILTROS ──────────────────────────────────────────────────

  aplicarFiltroEstado(): void {
    let lista = [...this.todasLasCitas];
    if (this.filtroEstadoCita === 'activo') lista = lista.filter(c => c.estado === 'Activo');
    else if (this.filtroEstadoCita === 'inactivo') lista = lista.filter(c => c.estado === 'Inactivo');
    if (this.filtroDoctor !== 'todos') {
      const dId = parseInt(this.filtroDoctor);
      lista = lista.filter(c => (c.tratamientos || []).some((ct: CitaTratamiento) => ct.tratamiento?.doctor?.id === dId));
    }
    this.citasFiltradas = lista;
  }

  onFiltroEstadoChange(): void { this.aplicarFiltroEstado(); this.cdr.detectChanges(); }
  onFiltroDoctorChange(): void { this.aplicarFiltroEstado(); this.cdr.detectChanges(); }

  // ── SELECCIÓN Y DIALOGS PRINCIPALES ─────────────────────────

  seleccionarCita(cita: Cita): void { this.selectedCita = cita; this.displayAccionesDialog = true; }

  esCitaAtendida(cita: Cita | null): boolean {
    return cita?.estadoCita?.nombre?.toLowerCase() === 'atendida';
  }

  abrirDialogEditar(): void {
    if (!this.selectedCita) return;
    this.citaParaForm = { ...this.selectedCita };
    if (typeof this.citaParaForm.fecha_cita === 'string')
      this.citaParaForm.fecha_cita = new Date(this.citaParaForm.fecha_cita);
    this.esNuevaCita = false;
    this.displayAccionesDialog = false;
    this.displayFormDialog = true;
  }

  guardarCita(): void {
    if (!this.citaForm.form.valid) { this.showToast('warn', 'Formulario Inválido', 'Revise los campos requeridos'); return; }
    this.citaService.updateCita(this.citaParaForm.id!, this.prepararCitaParaBackend(this.citaParaForm)).subscribe({
      next: () => { this.showToast('success', 'Actualizado', 'Cita actualizada con éxito'); this.cargarCitas(); this.displayFormDialog = false; },
      error: () => this.showToast('error', 'Error', 'No se pudo actualizar la cita')
    });
  }

  confirmarCambioEstado(): void {
    if (!this.selectedCita) return;
    const nuevoEstado = this.selectedCita.estado === 'Activo' ? 'Inactivo' : 'Activo';
    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado de la cita a ${nuevoEstado}?`,
      header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí', rejectLabel: 'Cancelar',
      accept: () => {
        this.citaService.updateCita(this.selectedCita!.id!, this.prepararCitaParaBackend({ ...this.selectedCita, estado: nuevoEstado })).subscribe({
          next: () => { this.showToast('success', 'Actualizado', `Cita ahora está ${nuevoEstado}`); this.cargarCitas(); this.displayAccionesDialog = false; },
          error: () => this.showToast('error', 'Error', 'No se pudo actualizar el estado')
        });
      }
    });
  }

  confirmarEliminar(): void {
    if (!this.selectedCita) return;
    this.confirmationService.confirm({
      message: '¿Está seguro de ELIMINAR PERMANENTEMENTE esta cita?',
      header: 'Confirmar Eliminación', icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.citaService.deleteCita(this.selectedCita!.id!).subscribe({
          next: () => { this.showToast('success', 'Eliminado', 'Cita eliminada'); this.cargarCitas(); this.displayAccionesDialog = false; },
          error: () => this.showToast('error', 'Error', 'No se pudo eliminar la cita')
        });
      }
    });
  }

  onAccionesDialogHide(): void {
    if (!this.displayTratamientosDialog && !this.displayInsumosDialog && !this.displayFacturaDialog)
      this.selectedCita = null;
  }

  // ── CAMBIO ESTADO CITA ───────────────────────────────────────

  abrirDialogCambiarEstadoCita(): void {
    if (!this.selectedCita) return;
    this.citaParaCambiarEstado = { ...this.selectedCita };
    this.estadoCitaSeleccionado = this.estadosCita.find(e => e.id === this.selectedCita?.estadoCita?.id) || null;
    this.displayAccionesDialog = false;
    this.displayCambiarEstadoCitaDialog = true;
  }

  guardarCambioEstadoCita(): void {
    if (!this.citaParaCambiarEstado || !this.estadoCitaSeleccionado) {
      this.showToast('warn', 'Advertencia', 'Debe seleccionar un estado'); return;
    }
    // Si el nuevo estado es "atendida", mostrar confirmación primero
    if (this.estadoCitaSeleccionado.nombre.toLowerCase() === 'atendida') {
      this.displayCambiarEstadoCitaDialog = false;
      this.displayConfirmarAtendidaDialog = true;
      return;
    }
    this.ejecutarCambioEstadoCita();
  }

  confirmarCambioAAtendida(): void {
    this.displayConfirmarAtendidaDialog = false;
    this.ejecutarCambioEstadoCita();
  }

  private ejecutarCambioEstadoCita(): void {
    const idCita = this.citaParaCambiarEstado!.id!;
    const nuevoEstadoNombre = this.estadoCitaSeleccionado!.nombre.toLowerCase();
    const citaActualizada = { ...this.citaParaCambiarEstado, estadoCita: this.estadoCitaSeleccionado };

    this.citaService.updateCita(idCita, this.prepararCitaParaBackend(citaActualizada)).subscribe({
      next: () => {
        if (this.estadoCitaSeleccionado?.nombre.toLowerCase() === 'confirmada')
          this.mostrarNotificacionCorreo(this.citaParaCambiarEstado?.paciente?.correo || '');

        if (nuevoEstadoNombre === 'atendida') {
          const montoTotal = this.obtenerTotalCita(this.citaParaCambiarEstado!);
          this.crearHistorialClinicoPorCita(idCita, montoTotal);
        }

        this.showToast('success', 'Actualizado', `Estado cambiado a ${this.estadoCitaSeleccionado?.nombre}`);
        this.cargarCitas();
        this.displayCambiarEstadoCitaDialog = false;
        this.citaParaCambiarEstado = null;
      },
      error: () => this.showToast('error', 'Error', 'No se pudo actualizar el estado de la cita')
    });
  }

  obtenerEstadosPermitidos(): EstadoCita[] {
    if (!this.citaParaCambiarEstado?.estadoCita) return this.estadosCita;
    const actual = this.citaParaCambiarEstado.estadoCita.nombre.toLowerCase();
    const transiciones: Record<string, string[]> = {
      'pendiente': ['confirmada', 'cancelada'],
      'confirmada': ['atendida', 'cancelada', 'no asistió'],
      'atendida': [], 'cancelada': [], 'no asistió': []
    };
    const permitidos = transiciones[actual] || [];
    if (!permitidos.length) return [];
    return this.estadosCita.filter(e => permitidos.includes(e.nombre.toLowerCase()));
  }

  // ── TRATAMIENTOS ─────────────────────────────────────────────

  abrirDialogTratamientos(): void {
    if (!this.selectedCita?.id) return;
    this.citaParaTratamientos = this.selectedCita;
    this.displayAccionesDialog = false;
    this.cargarTratamientosCita(this.selectedCita.id);
  }

  cargarTratamientosCita(citaId: number): void {
    this.citaTratamientoService.getCitaTratamientosByCitaId(citaId).subscribe({
      next: (data) => {
        this.tratamientosCita = data;
        if (this.citaParaTratamientos) this.citaParaTratamientos.tratamientos = data;
        if (this.selectedCita) this.selectedCita.tratamientos = data;
        const enLista = this.todasLasCitas.find(c => c.id === citaId);
        if (enLista) enLista.tratamientos = data;
        this.aplicarFiltroEstado();
        this.displayTratamientosDialog = true;
        this.cdr.detectChanges();
      },
      error: () => this.showToast('error', 'Error', 'No se pudieron cargar los tratamientos')
    });
  }

  agregarTratamientoCita(): void {
    if (!this.nuevoTratamiento || this.nuevoCosto <= 0) { this.showToast('warn', 'Validación', 'Seleccione un tratamiento y costo válido'); return; }
    if (!this.citaParaTratamientos?.id) { this.showToast('error', 'Error', 'No hay cita seleccionada'); return; }
    if (this.tratamientosCita.length >= 3) { this.showToast('warn', 'Límite', 'Máximo 3 tratamientos por cita'); return; }
    if (this.tratamientosCita.some(ct => ct.tratamiento?.id === this.nuevoTratamiento?.id)) { this.showToast('warn', 'Advertencia', 'Tratamiento ya agregado'); return; }

    this.citaTratamientoService.createCitaTratamiento({
      cita: { id: this.citaParaTratamientos.id },
      tratamiento: { id: this.nuevoTratamiento.id },
      costo_final: this.nuevoCosto, estado: 'Activo'
    } as any).subscribe({
      next: () => { this.showToast('success', 'Agregado', 'Tratamiento agregado'); this.cargarTratamientosCita(this.citaParaTratamientos!.id!); this.nuevoTratamiento = null; this.nuevoCosto = 0; },
      error: (e) => this.showToast('error', 'Error', 'No se pudo agregar: ' + (e.error?.message || e.message))
    });
  }

  eliminarTratamientoCita(ct: CitaTratamiento): void {
    if (!ct.id) return;
    if (this.tratamientosCita.length <= 1) { this.showToast('warn', 'Advertencia', 'La cita debe tener al menos un tratamiento'); return; }
    this.confirmationService.confirm({
      message: `¿Eliminar el tratamiento "${ct.tratamiento?.nombre}"?`,
      header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.citaTratamientoService.deleteCitaTratamiento(ct.id!).subscribe({
        next: () => { this.showToast('success', 'Eliminado', 'Tratamiento eliminado'); this.cargarTratamientosCita(this.citaParaTratamientos!.id!); },
        error: () => this.showToast('error', 'Error', 'No se pudo eliminar')
      })
    });
  }

  guardarCostoTratamiento(ct: CitaTratamiento): void {
    if (!ct.id || ct.costo_final <= 0) { this.showToast('warn', 'Validación', 'El costo debe ser mayor a 0'); return; }
    this.citaTratamientoService.updateCitaTratamiento(ct.id, {
      ...ct,
      cita: ct.cita?.id ? { id: ct.cita.id } : { id: this.citaParaTratamientos?.id },
      tratamiento: ct.tratamiento?.id ? { id: ct.tratamiento.id } : null
    } as any).subscribe({
      next: () => { this.showToast('success', 'Actualizado', 'Costo actualizado'); this.cargarTratamientosCita(this.citaParaTratamientos!.id!); },
      error: () => this.showToast('error', 'Error', 'No se pudo actualizar el costo')
    });
  }

  onTratamientoSeleccionado(): void {
    if (this.nuevoTratamiento) { this.nuevoCosto = this.nuevoTratamiento.costo_base; this.cdr.detectChanges(); }
  }

  onTratamientosDialogHide(): void {
    this.citaParaTratamientos = null; this.nuevoTratamiento = null; this.nuevoCosto = 0; this.tratamientosCita = [];
  }

  // ── USO DE INSUMOS ────────────────────────────────────────────

  abrirDialogInsumos(): void {
    if (!this.selectedCita?.id) return;
    this.citaParaInsumos = this.selectedCita;
    this.displayAccionesDialog = false;
    this.usoInsumos = [];
    this.displayInsumosDialog = true;
    // Carga en segundo plano — si falla o está vacío simplemente muestra tabla vacía
    this.usoInsumoService.getUsoInsumosByCitaId(this.selectedCita.id).subscribe({
      next: (data) => { this.usoInsumos = data || []; this.cdr.detectChanges(); },
      error: () => { this.usoInsumos = []; this.cdr.detectChanges(); }
    });
  }

  agregarInsumo(): void {
    if (!this.nuevoProducto || this.nuevaCantidadInsumo <= 0) { this.showToast('warn', 'Validación', 'Seleccione producto y cantidad válida'); return; }
    if (!this.citaParaInsumos?.id) return;
    if (this.nuevaCantidadInsumo > (this.nuevoProducto.cantidad || 0)) {
      this.showToast('warn', 'Stock insuficiente', `Solo hay ${this.nuevoProducto.cantidad} unidades disponibles`); return;
    }
    this.usoInsumoService.createUsoInsumo({
      cita: { id: this.citaParaInsumos.id },
      inventario: { id: this.nuevoProducto.id },
      cantidad_usada: this.nuevaCantidadInsumo,
      estado: 'Activo'
    }).subscribe({
      next: () => {
        this.showToast('success', 'Registrado', 'Insumo registrado');
        this.usoInsumoService.getUsoInsumosByCitaId(this.citaParaInsumos!.id!).subscribe(d => { this.usoInsumos = d; this.cdr.detectChanges(); });
        this.nuevoProducto = null; this.nuevaCantidadInsumo = 1; this.costoNuevoInsumo = 0;
        this.cargarInventario();
      },
      error: () => this.showToast('error', 'Error', 'No se pudo registrar el insumo')
    });
  }

  eliminarInsumo(uso: UsoInsumo): void {
    if (!uso.id) return;
    this.confirmationService.confirm({
      message: `¿Eliminar el uso de "${uso.inventario?.nombre}"?`,
      header: 'Confirmar', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí', rejectLabel: 'Cancelar', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.usoInsumoService.deleteUsoInsumo(uso.id!).subscribe({
        next: () => {
          this.showToast('success', 'Eliminado', 'Insumo eliminado');
          this.usoInsumos = this.usoInsumos.filter(u => u.id !== uso.id);
          this.cargarInventario();
          this.cdr.detectChanges();
        },
        error: () => this.showToast('error', 'Error', 'No se pudo eliminar el insumo')
      })
    });
  }

  onInsumosDialogHide(): void {
    this.citaParaInsumos = null; this.nuevoProducto = null; this.nuevaCantidadInsumo = 1; this.usoInsumos = []; this.costoNuevoInsumo = 0;
  }

  onProductoInsumoSeleccionado(): void {
    this.actualizarCostoNuevoInsumo();
  }

  actualizarCostoNuevoInsumo(): void {
    this.costoNuevoInsumo = (this.nuevoProducto?.costo_unitario || 0) * this.nuevaCantidadInsumo;
  }

  calcularTotalInsumos(): number {
    return this.usoInsumos.reduce((total, uso) => total + (uso.cantidad_usada * (uso.inventario?.costo_unitario || 0)), 0);
  }

  // ── FACTURA ───────────────────────────────────────────────────

  abrirDialogFactura(): void {
    if (!this.selectedCita) return;
    this.citaParaFactura = this.selectedCita;
    const tratamientos = this.selectedCita.tratamientos || [];
    const montoTotal = this.obtenerTotalCita(this.selectedCita);

    // Una línea por cada tratamiento con su precio final
    const detalles = tratamientos.map(ct => {
      const doctor = ct.tratamiento?.doctor
        ? ` — Dr. ${ct.tratamiento.doctor.nombre} ${ct.tratamiento.doctor.apellido}`
        : '';
      return {
        cantidad: 1,
        descripcion: `${ct.tratamiento?.nombre || 'Tratamiento'}${doctor}`,
        precio_unitario: ct.costo_final || 0,
        subtotal: ct.costo_final || 0,
        estado: 'Activo'
      };
    });

    this.facturaForm = new Factura();
    this.facturaForm.cita = { id: this.selectedCita.id } as any;
    this.facturaForm.monto_total = montoTotal;
    this.facturaForm.fecha_emision = new Date();
    this.facturaForm.estadoPago = this.estadosPago.find(e => e.id === 1) || this.estadosPago[0] || null;
    this.facturaForm.metodoPago = this.metodosPago.find(m => m.id === 1) || this.metodosPago[0] || null;
    this.facturaForm.detalles = detalles.length > 0 ? detalles : [{
      cantidad: 1, descripcion: 'Servicios dentales',
      precio_unitario: montoTotal, subtotal: montoTotal, estado: 'Activo'
    }];

    this.displayAccionesDialog = false;
    this.displayFacturaDialog = true;
  }

  guardarFactura(): void {
    if (!this.citaParaFactura?.id || !this.facturaForm.estadoPago || !this.facturaForm.metodoPago) {
      this.showToast('warn', 'Validación', 'Complete todos los campos requeridos'); return;
    }
    const payload = {
      estado: 'Activo',
      fecha_emision: this.formatearFecha(this.facturaForm.fecha_emision),
      monto_total: this.facturaForm.monto_total,
      cita: { id: this.citaParaFactura.id },
      estadoPago: { id: this.facturaForm.estadoPago.id },
      metodoPago: { id: this.facturaForm.metodoPago.id },
      detalles: this.facturaForm.detalles.map(d => ({
        cantidad: d.cantidad,
        descripcion: d.descripcion,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
        estado: 'Activo'
      }))
    };
    this.facturaService.createFactura(payload).subscribe({
      next: () => { this.showToast('success', 'Factura generada', 'Nota de venta generada correctamente'); this.displayFacturaDialog = false; },
      error: (e) => {
        if (e.status === 409) { this.showToast('info', 'Aviso', 'Esta cita ya tiene una nota de venta registrada'); return; }
        this.showToast('error', 'Error', 'No se pudo generar la nota de venta');
      }
    });
  }

  calcularSubtotalDetalle(detalle: DetalleFactura): void {
    // precio_unitario es de solo lectura, el subtotal se actualiza desde monto_total global
    this.facturaForm.monto_total = this.facturaForm.detalles.reduce((s, d) => s + d.subtotal, 0);
  }

  onFacturaDialogHide(): void { this.citaParaFactura = null; }

  // ── HISTORIAL CLÍNICO ─────────────────────────────────────────

  crearHistorialClinicoPorCita(citaId: number, montoTotal: number): void {
    const notas = this.generarNotasDeTratamientos(this.citaParaCambiarEstado?.tratamientos || []);
    this.historialClinicoService.createHistorialPorCita(citaId, montoTotal, notas).subscribe({
      next: () => this.showToast('success', 'Historial Clínico', 'Historial clínico creado'),
      error: (e) => {
        if (e.status === 409) { this.showToast('info', 'Historial Clínico', 'Ya existe un historial para esta cita'); return; }
        this.showToast('warn', 'Historial Clínico', 'Cita atendida, pero no se pudo crear el historial automáticamente');
      }
    });
  }

  private generarNotasDeTratamientos(tratamientos: CitaTratamiento[]): string {
    if (!tratamientos?.length) return '';
    const lineas = tratamientos.map(ct => {
      const nombre = ct.tratamiento?.nombre || 'Tratamiento';
      const costo = ct.costo_final ? `S/ ${ct.costo_final.toFixed(2)}` : '';
      return costo ? `- ${nombre} (${costo})` : `- ${nombre}`;
    });
    return `Tratamientos realizados:\n${lineas.join('\n')}`;
  }

  // ── UTILIDADES ────────────────────────────────────────────────

  obtenerTotalCita(cita: Cita): number {
    return (cita.tratamientos || []).reduce((t, ct) => t + (ct.costo_final || 0), 0);
  }

  calcularTotalCita(): number {
    return this.tratamientosCita.reduce((t, ct) => t + ct.costo_final, 0);
  }

  obtenerDoctoresDeCita(cita: Cita): string {
    const doctores = new Set<string>();
    (cita.tratamientos || []).forEach((ct: CitaTratamiento) => {
      if (ct.tratamiento?.doctor) doctores.add(`Dr. ${ct.tratamiento.doctor.nombre} ${ct.tratamiento.doctor.apellido}`);
    });
    return doctores.size > 0 ? Array.from(doctores).join(', ') : 'Sin asignar';
  }

  prepararCitaParaBackend(cita: any): any {
    return { ...cita, fecha_cita: cita.fecha_cita ? this.formatearFecha(cita.fecha_cita) : null };
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  formatearFechaDisplay(fecha: Date | string): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') {
      const [y, m, d] = fecha.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    }
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getSeverityEstadoCita(nombre: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (nombre?.toLowerCase()) {
      case 'pendiente': return 'warn';
      case 'confirmada': return 'info';
      case 'atendida': return 'success';
      case 'cancelada': return 'danger';
      default: return 'info';
    }
  }

  mostrarNotificacionCorreo(email: string): void {
    setTimeout(() => this.showToast('info', '📧 Confirmación Enviada', `Se envió confirmación a: ${email}`), 1000);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
