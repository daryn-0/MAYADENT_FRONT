import { EstadoCita } from './estado_cita';
import { Paciente } from './paciente';
import { Usuario } from './usuario';
import { CitaTratamiento } from './cita_tratamiento';
export type Estado = 'Activo' | 'Inactivo';

export class Cita {
    id?: number;
    fecha_cita: Date | string
    hora_cita: string;
    descripcion: string;
    recordatorioEnviado: boolean;
    estado: Estado;
    estadoCita: EstadoCita | null;
    paciente: Paciente | null;
    usuario: Usuario | null;
    tratamientos: CitaTratamiento[];

    constructor(
        id?: number,
        fecha_cita: Date | string = new Date(),
        hora_cita: string = '',
        descripcion: string = '',
        recordatorioEnviado: boolean = false,
        estado: Estado = 'Activo',
        estadoCita: EstadoCita | null = null,
        paciente: Paciente | null = null,
        usuario: Usuario | null = null,
        tratamientos: CitaTratamiento[] = []
    ) {
        this.id = id;
        this.fecha_cita = fecha_cita;
        this.hora_cita = hora_cita;
        this.descripcion = descripcion;
        this.recordatorioEnviado = recordatorioEnviado;
        this.estado = estado;
        this.estadoCita = estadoCita;
        this.paciente = paciente;
        this.usuario = usuario;
        this.tratamientos = tratamientos;
    }
}
