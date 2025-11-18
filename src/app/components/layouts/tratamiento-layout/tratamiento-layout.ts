import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tratamiento-layout',
  standalone: true,
  imports: [ RouterOutlet, CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './tratamiento-layout.html',
  styleUrl: './tratamiento-layout.css'
})
export class TratamientoLayout {

}
