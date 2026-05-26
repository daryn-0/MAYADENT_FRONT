import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoCita } from '../models/estado_cita';

@Injectable({
  providedIn: 'root'
})
export class EstadoCitaService {

  private apiUrl = 'http://localhost:8080/estadoCitas';

  constructor(private http: HttpClient) { }

  getEstadosCita(): Observable<EstadoCita[]> {
    return this.http.get<EstadoCita[]>(this.apiUrl);
  }

  getEstadoCitaById(id: number): Observable<EstadoCita> {
    return this.http.get<EstadoCita>(`${this.apiUrl}/${id}`);
  }
}
