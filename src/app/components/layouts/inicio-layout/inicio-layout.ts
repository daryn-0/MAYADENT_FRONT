import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Imports de PrimeNG para las tarjetas
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; // Para efecto click

@Component({
  selector: 'app-inicio-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    RippleModule
  ],
  templateUrl: './inicio-layout.html',
  styleUrl: './inicio-layout.css'
})
export class InicioLayout {

}
