import { Doctor } from "./doctor";// <-- Importa el modelo Doctor

// Define los estados posibles para Tratamiento
export type EstadoTratamiento = 'Activo' | 'Inactivo';

export class Tratamiento {
    id? : number;
    nombre : string;
    descripcion : string;
    costo_base : number;
    estado : EstadoTratamiento;
    doctor : Doctor | null; // <-- CAMBIO 1: Permitir null aquí

    constructor ( 
        id?: number,
        nombre: string = '',
        descripcion: string = '',
        costo_base: number = 0,
        estado: EstadoTratamiento = 'Activo',
        doctor: Doctor | null = null // El doctor puede ser nulo al inicio
    ) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.costo_base = costo_base;
        this.estado = estado;
        
        // CAMBIO 2: Asignar directamente. Si es null, será null.
        this.doctor = doctor;
    }
}