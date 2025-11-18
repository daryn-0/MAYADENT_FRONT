import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-menu-layout',
  standalone: true,
  // <-- ¡Añádelos al array de imports!
  imports: [ RouterOutlet, CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './menu-layout.html',
  styleUrl: './menu-layout.css'
})
export class MenuLayout {

}
