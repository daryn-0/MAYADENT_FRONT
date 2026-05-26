import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pacientes-layout',
  standalone: true,
  imports: [ RouterOutlet, CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './pacientes-layout.html',
  styleUrl: './pacientes-layout.css'
})
export class PacientesLayout {

}
