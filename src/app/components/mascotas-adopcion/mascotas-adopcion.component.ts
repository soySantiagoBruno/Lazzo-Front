import { Component, OnInit } from '@angular/core';
import { NavbarUsuarioComponent } from "../navbars/navbar-usuario/navbar-usuario.component";
import { Pet, PETS } from '../../mocks/pets.mock';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-mascotas-adopcion',
    standalone: true,
    templateUrl: './mascotas-adopcion.component.html',
    styleUrl: './mascotas-adopcion.component.css',
    imports: [NavbarUsuarioComponent, NgFor]
})
export class MascotasAdopcionComponent implements OnInit{
    
    mascotas: Pet[] = []    
    
    ngOnInit(): void {
        this.mascotas = PETS
    }
    

    
}
