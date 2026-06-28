import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetodoPago } from '../models/metodo_pago';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private apiUrl = 'http://localhost:8080/metodoPagos';

  constructor(private http: HttpClient) {}

  getMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.apiUrl);
  }
}
