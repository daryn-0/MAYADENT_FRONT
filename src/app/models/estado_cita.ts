export class EstadoCita {
    id?: number;
    nombre: string;
    estado: string;

    constructor(
        id?: number,
        nombre: string = '',
        estado: string = 'Activo'
    ) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
    }
}
