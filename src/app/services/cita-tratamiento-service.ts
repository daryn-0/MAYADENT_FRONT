import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitaTratamiento } from '../models/cita_tratamiento';

@Injectable({
  providedIn: 'root'
})
export class CitaTratamientoService {

  private apiUrl = 'http://localhost:8080/citaTratamientos';

  constructor(private http: HttpClient) { }

  getCitaTratamientos(): Observable<CitaTratamiento[]> {
    return this.http.get<CitaTratamiento[]>(this.apiUrl);
  }

  getCitaTratamientoById(id: number): Observable<CitaTratamiento> {
    return this.http.get<CitaTratamiento>(`${this.apiUrl}/${id}`);
  }

  getCitaTratamientosByCitaId(citaId: number): Observable<CitaTratamiento[]> {
    return this.http.get<CitaTratamiento[]>(`${this.apiUrl}/cita/${citaId}`);
  }

  createCitaTratamiento(citaTratamiento: CitaTratamiento): Observable<CitaTratamiento> {
    return this.http.post<CitaTratamiento>(this.apiUrl, citaTratamiento);
  }

  updateCitaTratamiento(id: number, citaTratamiento: CitaTratamiento): Observable<CitaTratamiento> {
    return this.http.put<CitaTratamiento>(`${this.apiUrl}/${id}`, citaTratamiento);
  }

  deleteCitaTratamiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
