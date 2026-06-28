import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoPago } from '../models/estado_pago';

@Injectable({ providedIn: 'root' })
export class EstadoPagoService {
  private apiUrl = 'http://localhost:8080/estadoPagos';

  constructor(private http: HttpClient) {}

  getEstadosPago(): Observable<EstadoPago[]> {
    return this.http.get<EstadoPago[]>(this.apiUrl);
  }
}
