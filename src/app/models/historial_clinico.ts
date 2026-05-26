import { Cita } from './cita';
import { Paciente } from './paciente';

export type EstadoHistorialClinico = 'Activo' | 'Inactivo';

export class HistorialClinico {
  id?: number;
  fecha_emision: Date | string;
  monto_total: number;
  estado: EstadoHistorialClinico;
  paciente: Paciente | null;
  cita: Cita | null;

  constructor(
    id?: number,
    fecha_emision: Date | string = new Date(),
    monto_total: number = 0,
    estado: EstadoHistorialClinico = 'Activo',
    paciente: Paciente | null = null,
    cita: Cita | null = null
  ) {
    this.id = id;
    this.fecha_emision = fecha_emision;
    this.monto_total = monto_total;
    this.estado = estado;
    this.paciente = paciente;
    this.cita = cita;
  }
}
