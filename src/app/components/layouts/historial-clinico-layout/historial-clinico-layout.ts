import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-clinico-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './historial-clinico-layout.html',
  styleUrl: './historial-clinico-layout.css'
})
export class HistorialClinicoLayout {
}
