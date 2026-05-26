import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialClinico } from '../models/historial_clinico';

@Injectable({
  providedIn: 'root'
})
export class HistorialClinicoService {
  private apiUrl = 'http://localhost:8080/historiales-clinicos';

  constructor(private http: HttpClient) { }

  getHistoriales(): Observable<HistorialClinico[]> {
    return this.http.get<HistorialClinico[]>(this.apiUrl);
  }

  getHistorialById(id: number): Observable<HistorialClinico> {
    return this.http.get<HistorialClinico>(`${this.apiUrl}/${id}`);
  }

  getHistorialByCitaId(citaId: number): Observable<HistorialClinico> {
    return this.http.get<HistorialClinico>(`${this.apiUrl}/cita/${citaId}`);
  }

  createHistorial(historial: HistorialClinico): Observable<HistorialClinico> {
    return this.http.post<HistorialClinico>(this.apiUrl, historial);
  }

  updateHistorial(id: number, historial: HistorialClinico): Observable<HistorialClinico> {
    return this.http.put<HistorialClinico>(`${this.apiUrl}/${id}`, historial);
  }

  deleteHistorial(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createHistorialPorCita(citaId: number): Observable<HistorialClinico> {
    return this.http.post<HistorialClinico>(`${this.apiUrl}/cita/${citaId}`, {});
  }
}
