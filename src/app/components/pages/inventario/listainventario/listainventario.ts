import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Inventario } from '../../../../models/inventario';
import { InventarioService } from '../../../../services/inventario-service';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-listainventario',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    ToolbarModule
  ],
  templateUrl: './listainventario.html',
  styleUrl: './listainventario.css',
  providers: [MessageService]
})
export class Listainventario implements OnInit {

  inventariosActivos: Inventario[] = [];

  constructor(
    private inventarioService: InventarioService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inventariosActivos = [];
    this.cargarInventarios();
  }

  cargarInventarios(): void {
    this.inventarioService.getInventarios().subscribe({
      next: (data) => {
        if (!data || !Array.isArray(data)) {
          this.inventariosActivos = [];
          this.cdr.detectChanges();
          return;
        }
        this.inventariosActivos = data.filter(i => i.estado === 'Activo');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar inventarios:', error);
        this.inventariosActivos = [];
        this.showToast('error', 'Error', 'No se pudieron cargar los inventarios');
      }
    });
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return 'Sin vencimiento';
    const date = typeof fecha === 'string' ? this.parsearFechaLocal(fecha) : fecha;
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  parsearFechaLocal(fechaString: string): Date {
    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  getSeverityStock(cantidad: number): 'success' | 'warn' | 'danger' {
    if (cantidad > 20) return 'success';
    if (cantidad > 5) return 'warn';
    return 'danger';
  }

  irARegistro(): void {
    this.router.navigate(['/inventario/registro']);
  }

  irAGestion(): void {
    this.router.navigate(['/inventario/gestion']);
  }

  private showToast(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
