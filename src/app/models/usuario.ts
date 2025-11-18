export class Usuario {
    id?: number;
    nombre?: string;
    email?: string;
    // Agrega más campos según tu backend

    constructor(
        id?: number,
        nombre?: string,
        email?: string
    ) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
    }
}
