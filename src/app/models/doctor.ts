export type EstadoDoctor = 'Activo' | 'Inactivo';

export class Doctor {
    id? : number;
    nombre : string;
    apellido : string;
    telefono : string;
    correo : string;
    estado : EstadoDoctor;

    constructor ( 
        id?: number,
        nombre: string = '',
        apellido: string = '',
        telefono: string = '', 
        correo: string = '',
        estado: EstadoDoctor = 'Activo'
    ) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.correo = correo;
        this.estado = estado;
    }
}