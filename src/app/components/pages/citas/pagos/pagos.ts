import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FacturaService } from '../../../../services/factura-service';
import { CitaTratamientoService } from '../../../../services/cita-tratamiento-service';
import { Factura } from '../../../../models/factura';
import { CitaTratamiento } from '../../../../models/cita_tratamiento';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    ToastModule, CardModule, TooltipModule, InputTextModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
  providers: [MessageService]
})
export class Pagos implements OnInit {
  facturas: Factura[] = [];
  facturasFiltradas: Factura[] = [];
  filtroPaciente: string = '';
  loading = true;

  constructor(
    private facturaService: FacturaService,
    private citaTratamientoService: CitaTratamientoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.loading = true;
    this.facturaService.getFacturas().subscribe({
      next: (data) => {
        this.facturas = data || [];
        this.facturasFiltradas = [...this.facturas];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas' });
      }
    });
  }

  filtrar(): void {
    const t = this.filtroPaciente.toLowerCase().trim();
    if (!t) { this.facturasFiltradas = [...this.facturas]; return; }
    this.facturasFiltradas = this.facturas.filter(f => {
      const pac = f.cita?.paciente;
      const nombre = `${pac?.nombre || ''} ${pac?.apellido || ''}`.toLowerCase();
      const dni = (pac?.dni || '').toLowerCase();
      return nombre.includes(t) || dni.includes(t);
    });
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '-';
    if (typeof fecha === 'string') {
      const [y, m, d] = fecha.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
    }
    return fecha.toLocaleDateString('es-PE');
  }

  obtenerPaciente(f: Factura): string {
    const p = f.cita?.paciente;
    return p ? `${p.nombre} ${p.apellido}` : '-';
  }

  generarPDF(factura: Factura): void {
    const citaId = factura.cita?.id;
    if (!citaId) {
      this.construirPDF(factura, []);
      return;
    }
    this.citaTratamientoService.getCitaTratamientosByCitaId(citaId).subscribe({
      next: (tratamientos) => this.construirPDF(factura, tratamientos || []),
      error: () => this.construirPDF(factura, [])
    });
  }

  private construirPDF(factura: Factura, tratamientos: CitaTratamiento[]): void {
    const detalles = tratamientos.length > 0
      ? tratamientos.map(ct => {
          const doctor = ct.tratamiento?.doctor
            ? ` — Dr. ${ct.tratamiento.doctor.nombre} ${ct.tratamiento.doctor.apellido}`
            : '';
          return {
            descripcion: `${ct.tratamiento?.nombre || 'Tratamiento'}${doctor}`,
            cantidad: 1,
            precio_unitario: ct.costo_final || 0,
            subtotal: ct.costo_final || 0
          };
        })
      : [{ descripcion: 'Servicios dentales', cantidad: 1,
           precio_unitario: factura.monto_total, subtotal: factura.monto_total }];

    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      const col2 = pageW / 2;
      let y = 20;

      // ── CABECERA ──────────────────────────────────────────────
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255);
      doc.text('COMPROBANTE DE PAGO', col2, 13, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('MayaDent — Clínica Dental', col2, 22, { align: 'center' });
      y = 36;

      // ── INFO COMPROBANTE ──────────────────────────────────────
      doc.setTextColor(0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('N° Comprobante:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${factura.id || '-'}`, 46, y);
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha de Emisión:', col2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${this.formatearFecha(factura.fecha_emision)}`, col2 + 33, y);
      y += 5;
      doc.setDrawColor(220);
      doc.line(14, y, pageW - 14, y);
      y += 7;

      // ── DATOS DEL PACIENTE ────────────────────────────────────
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 3, pageW - 28, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('DATOS DEL PACIENTE', 16, y + 2);
      doc.setTextColor(0);
      y += 10;

      const p = factura.cita?.paciente;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold'); doc.text('Nombre:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${p?.nombre || '-'} ${p?.apellido || ''}`, 36, y);
      doc.setFont('helvetica', 'bold'); doc.text('DNI:', col2, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${p?.dni || '-'}`, col2 + 14, y);
      y += 6;
      doc.setFont('helvetica', 'bold'); doc.text('Teléfono:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${p?.telefono || '-'}`, 36, y);
      doc.setFont('helvetica', 'bold'); doc.text('Correo:', col2, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${p?.correo || '-'}`, col2 + 18, y);
      y += 6;
      doc.setFont('helvetica', 'bold'); doc.text('Dirección:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${p?.direccion || '-'}`, 36, y);
      y += 8;

      // ── DATOS DE LA CITA ──────────────────────────────────────
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 3, pageW - 28, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('DATOS DE LA CITA', 16, y + 2);
      doc.setTextColor(0);
      y += 10;
      doc.setFontSize(9);
      const fechaCita = factura.cita?.fecha_cita ? this.formatearFecha(factura.cita.fecha_cita) : '-';
      const horaCita = factura.cita?.hora_cita || '-';
      doc.setFont('helvetica', 'bold'); doc.text('Fecha:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(`${fechaCita} — ${horaCita}`, 30, y);
      y += 8;

      // ── DETALLE DE SERVICIOS ──────────────────────────────────
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 3, pageW - 28, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('DETALLE DE SERVICIOS', 16, y + 2);
      doc.setTextColor(0);
      y += 10;

      // Cabecera tabla
      doc.setFillColor(41, 128, 185);
      doc.rect(14, y - 2, pageW - 28, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255);
      doc.text('Descripción', 16, y + 4);
      doc.text('Cant.', pageW - 75, y + 4, { align: 'right' });
      doc.text('P. Unit.', pageW - 45, y + 4, { align: 'right' });
      doc.text('Subtotal', pageW - 15, y + 4, { align: 'right' });
      y += 10;
      doc.setTextColor(0);

      let rowAlt = false;
      detalles.forEach(d => {
        const desc = doc.splitTextToSize(d.descripcion || '-', 95);
        const rowH = Math.max(desc.length * 5 + 3, 8);
        if (rowAlt) {
          doc.setFillColor(248, 248, 248);
          doc.rect(14, y - 2, pageW - 28, rowH, 'F');
        }
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(desc, 16, y + 2);
        doc.text(`${d.cantidad}`, pageW - 75, y + 2, { align: 'right' });
        doc.text(`S/ ${(d.precio_unitario || 0).toFixed(2)}`, pageW - 45, y + 2, { align: 'right' });
        doc.text(`S/ ${(d.subtotal || 0).toFixed(2)}`, pageW - 15, y + 2, { align: 'right' });
        y += rowH;
        rowAlt = !rowAlt;
      });

      doc.setDrawColor(200);
      doc.line(14, y, pageW - 14, y);
      y += 7;

      // ── TOTAL ─────────────────────────────────────────────────
      doc.setFillColor(41, 128, 185);
      doc.rect(pageW - 75, y - 3, 61, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255);
      doc.text('TOTAL:', pageW - 70, y + 4);
      doc.text(`S/ ${(factura.monto_total || 0).toFixed(2)}`, pageW - 15, y + 4, { align: 'right' });
      doc.setTextColor(0);
      y += 16;

      // ── INFO DE PAGO ──────────────────────────────────────────
      doc.setFillColor(245, 245, 245);
      doc.rect(14, y - 3, pageW - 28, 7, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('INFORMACIÓN DE PAGO', 16, y + 2);
      doc.setTextColor(0);
      y += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold'); doc.text('Estado de Pago:', 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(factura.estadoPago?.nombre || '-', 46, y);
      doc.setFont('helvetica', 'bold'); doc.text('Método de Pago:', col2, y);
      doc.setFont('helvetica', 'normal'); doc.text(factura.metodoPago?.nombre || '-', col2 + 34, y);
      y += 14;

      // ── PIE ───────────────────────────────────────────────────
      doc.setDrawColor(200);
      doc.line(14, y, pageW - 14, y);
      y += 6;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Gracias por su preferencia — MayaDent Clínica Dental', col2, y, { align: 'center' });

      const pacNombre = this.obtenerPaciente(factura).replace(/\s+/g, '_');
      doc.save(`comprobante_${factura.id || 'pago'}_${pacNombre}.pdf`);
    });
  }
}
