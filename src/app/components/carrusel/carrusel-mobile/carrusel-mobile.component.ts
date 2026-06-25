import { NgForOf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import Swiper from 'swiper';


@Component({
  selector: 'app-carrusel-mobile',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './carrusel-mobile.component.html',
  styleUrl: './carrusel-mobile.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarruselMobileComponent {
  @Input() mascotas: any;
}
