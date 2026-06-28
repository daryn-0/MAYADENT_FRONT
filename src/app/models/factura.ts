import { Cita } from './cita';
import { EstadoPago } from './estado_pago';
import { MetodoPago } from './metodo_pago';
import { DetalleFactura } from './detalle_factura';

export class Factura {
  id?: number;
  estado: string = 'Activo';
  fecha_emision: Date | string = new Date();
  monto_total: number = 0;
  cita: Cita | null = null;
  estadoPago: EstadoPago | null = null;
  metodoPago: MetodoPago | null = null;
  detalles: DetalleFactura[] = [];
}
