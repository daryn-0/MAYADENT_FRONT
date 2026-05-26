export type Genero = 'Masculino' | 'Femenino' | '';
export type Estado = 'Activo' | 'Inactivo';

export class Paciente {
    id? : number;
    nombre : string;
    apellido : string;
    direccion : string;
    telefono : string;
    correo : string;
    dni: string;
    genero : Genero;
    fecha_nacimiento : Date;
    estado : Estado;

    constructor ( 
        id?: number,
        nombre: string = '',
        apellido: string = '',
        direccion: string = '',
        telefono: string = '', 
        correo: string = '',
        dni: string = '',
        genero: Genero = '',
        fecha_nacimiento: Date = new Date(),
        estado: Estado = 'Activo',
    ) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.direccion = direccion;
        this.telefono = telefono;
        this.correo = correo;
        this.dni = dni;
        this.genero = genero;
        this.fecha_nacimiento = fecha_nacimiento;
        this.estado = estado;
    }
}
