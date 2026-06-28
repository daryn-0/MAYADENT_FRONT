import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { UsoInsumo } from '../models/uso_insumo';

@Injectable({ providedIn: 'root' })
export class UsoInsumoService {
  private apiUrl = 'http://localhost:8080/usoInsumos';

  constructor(private http: HttpClient) {}

  // El backend devuelve 204 cuando no hay datos, manejamos ese caso
  getUsoInsumosByCitaId(citaId: number): Observable<UsoInsumo[]> {
    return this.http.get<UsoInsumo[]>(this.apiUrl).pipe(
      map(lista => (lista || []).filter(u => u.cita?.id === citaId)),
      catchError(() => of([]))
    );
  }

  createUsoInsumo(usoInsumo: any): Observable<UsoInsumo> {
    return this.http.post<UsoInsumo>(this.apiUrl, usoInsumo);
  }

  updateUsoInsumo(id: number, usoInsumo: any): Observable<UsoInsumo> {
    return this.http.put<UsoInsumo>(`${this.apiUrl}/${id}`, usoInsumo);
  }

  deleteUsoInsumo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
