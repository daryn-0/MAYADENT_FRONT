import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura } from '../models/factura';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private apiUrl = 'http://localhost:8080/facturas';

  constructor(private http: HttpClient) {}

  getFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.apiUrl);
  }

  getFacturaByCitaId(citaId: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.apiUrl}/cita/${citaId}`);
  }

  createFactura(factura: any): Observable<Factura> {
    return this.http.post<Factura>(this.apiUrl, factura);
  }

  updateFactura(id: number, factura: any): Observable<Factura> {
    return this.http.put<Factura>(`${this.apiUrl}/${id}`, factura);
  }
}
