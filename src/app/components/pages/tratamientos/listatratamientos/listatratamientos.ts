import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Observable, map } from 'rxjs';
import { Tratamiento } from '../../../../models/tratamiento';
import { TratamientoService } from '../../../../services/tratamiento-service';

@Component({
  selector: 'app-listatratamientos',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    InputTextModule
  ],
  templateUrl: './listatratamientos.html',
  styleUrl: './listatratamientos.css'
})
export class ListaTratamientos implements OnInit{
  public tratamientos$: Observable<Tratamiento[]>;
  public totalTratamientos: number = 0;

  constructor(private tratamientoService: TratamientoService) {
    // Inicializar el observable vacío
    this.tratamientos$ = new Observable<Tratamiento[]>();
  }

  ngOnInit(): void {
    this.cargarTratamientosActivos();
  }

  cargarTratamientosActivos(): void {
    this.tratamientos$ = this.tratamientoService.getTratamientos().pipe(
      map(tratamientos => {
        // Filtramos solo los activos
        const activos = tratamientos.filter(t => t.estado === 'Activo');
        this.totalTratamientos = activos.length;
        return activos;
      })
    );
  }
}
