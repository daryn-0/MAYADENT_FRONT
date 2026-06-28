import { Cita } from './cita';
import { Inventario } from './inventario';

export class UsoInsumo {
  id?: number;
  cantidad_usada: number = 1;
  estado: string = 'Activo';
  cita: Cita | null = null;
  inventario: Inventario | null = null; // nombre real en el backend
}
