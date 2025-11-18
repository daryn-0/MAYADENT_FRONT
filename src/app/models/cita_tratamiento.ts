import { Cita } from './cita';
import { Tratamiento } from './tratamiento';
export type Estado = 'Activo' | 'Inactivo';

export class CitaTratamiento {
    id?: number;
    costo_final: number;
    estado: Estado;
    cita: Cita | null;
    tratamiento: Tratamiento | null;

    constructor(
        id?: number,
        costo_final: number = 0,
        estado: Estado = 'Activo',
        cita: Cita | null = null,
        tratamiento: Tratamiento | null = null
    ) {
        this.id = id;
        this.costo_final = costo_final;
        this.estado = estado;
        this.cita = cita;
        this.tratamiento = tratamiento;
    }
}
