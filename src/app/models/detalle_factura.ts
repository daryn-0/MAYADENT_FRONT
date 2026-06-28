export class DetalleFactura {
  id?: number;
  cantidad: number = 1;
  descripcion: string = '';
  precio_unitario: number = 0;
  subtotal: number = 0;
  estado: string = 'Activo';
  // id_factura se asigna por el backend al crear la factura
}
