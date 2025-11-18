import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:8080/pacientes'; // Ajusta según tu backend

  constructor(private http: HttpClient) { }

  // Obtener todos los pacientes
  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}`);
  }

  getPacientesActivos(): Observable<Paciente[]> {
    const url = `${this.apiUrl}/estado/Activo`;
    return this.http.get<Paciente[]>(url);
  }

  getPacienteByDni(dni: string): Observable<Paciente> {
    const url = `${this.apiUrl}/dni/${dni}`;
    return this.http.get<Paciente>(url);
  }
  // Obtener paciente por ID
  getPacienteById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  // Crear paciente
  createPaciente(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiUrl}`, paciente);
  }

  // Actualizar paciente
  updatePaciente(id: number, paciente: Paciente): Observable<Paciente> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Paciente>(url, paciente);
  }

  // Eliminar paciente
  deletePaciente(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
  
}
