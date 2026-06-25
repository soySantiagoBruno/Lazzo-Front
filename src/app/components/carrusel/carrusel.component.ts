import { Component, Inject, OnInit, AfterViewInit, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { isPlatformBrowser, NgFor } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CartaComponent } from './carta/carta.component';
import { Pet, PETS } from '../../mocks/pets.mock';
import ColorThief from 'colorthief';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper/types'; register();


@Component({
  selector: 'app-carrusel',
  standalone: true,
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css',
  imports: [NgFor],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  
})
export class CarruselComponent implements OnInit, AfterViewInit {
  pets: Pet[] = [];

  constructor(
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.pets = PETS;
  }

  ngAfterViewInit(): void {
    this.backgroundDinamico();
    
  }

  spaceBetween = 10;




  backgroundDinamico(){
    /* Con esto se va a generar un background dinamica en base a las imagenes */
    if (!isPlatformBrowser(this.platformId)) return; // evita errores en SSR

    const colorThief = new ColorThief();

    this.pets.forEach((pet) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = pet.image;

      img.onload = () => {
        try {
          const color = colorThief.getColor(img); // [r, g, b]
          const gradient = `linear-gradient(145deg, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.85), rgba(0,0,0,0.6))`;
          pet.background = gradient;
        } catch (e) {
          // fallback si falla la extracción
          pet.background = 'linear-gradient(145deg, #444, #111)';
        }
      };
    });
  }

  getWhatsappLink(pet: Pet): string {
    const phone = pet.contact?.whatsapp || pet.contact?.phone || '';
    const text = `Hola! quiero adoptar a ${pet.name}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  abrirModal(pet: Pet) {
    const modalRef = this.modalService.open(CartaComponent, {
      windowClass: 'modal-xl d-flex justify-content-center',
      modalDialogClass: 'modal-fullscreen-xl-down m-0',
    });
    modalRef.componentInstance.pet = pet;
  }

  cerrarModal() {
    this.modalService.dismissAll();
  }


}
