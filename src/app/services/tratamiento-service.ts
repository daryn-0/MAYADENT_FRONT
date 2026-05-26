import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tratamiento } from '../models/tratamiento';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private apiUrl = 'http://localhost:8080/tratamientos'; 

  constructor(private http: HttpClient) { }

  getTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(this.apiUrl);
  }

  createTratamiento(tratamiento: Tratamiento): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(this.apiUrl, tratamiento);
  }

  /**
   * Actualiza un tratamiento existente
   * @param id El ID del tratamiento a actualizar
   * @param tratamiento El objeto Tratamiento con los datos actualizados
   */
  updateTratamiento(id: number, tratamiento: Tratamiento): Observable<Tratamiento> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Tratamiento>(url, tratamiento);
  }
  /**
   * Elimina un tratamiento permanentemente
   * @param id El ID del tratamiento a eliminar
   */
  deleteTratamiento(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}

