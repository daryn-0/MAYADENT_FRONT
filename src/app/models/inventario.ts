import { Usuario } from './usuario';

export class Inventario {
  id?: number;
  nombre: string = '';
  descripcion: string = '';
  cantidad: number = 0;
  unidad_medida: string = '';
  costo_unitario: number = 0;
  fecha_vencimiento?: Date | string;
  estado: string = 'Activo';
  usuario?: Usuario;
}
