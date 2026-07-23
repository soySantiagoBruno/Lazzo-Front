import { Component, OnInit } from '@angular/core';
import { NavbarUsuarioComponent } from "../navbars/navbar-usuario/navbar-usuario.component";
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MascotaRegisterDto } from '../../models/pet-dto';
import { MascotaService } from '../../services/mascota.service';
import { Auth } from '@angular/fire/auth';

@Component({
    selector: 'app-mascotas-adopcion',
    standalone: true,
    templateUrl: './mascotas-adopcion.component.html',
    styleUrl: './mascotas-adopcion.component.css',
    imports: [NavbarUsuarioComponent, NgFor, NgIf, RouterLink]
})
export class MascotasAdopcionComponent implements OnInit{

    mascotas: MascotaRegisterDto[] = [];
    cargando = true;

    constructor(
        private mascotaService: MascotaService,
        private auth: Auth
    ) {}
    
    async ngOnInit(): Promise<void> {
        console.log('Usuario actual:', this.auth.currentUser);

        try {
            this.mascotas = await this.mascotaService.obtenerMascotas();
            console.log('Mascotas cargadas:', this.mascotas);
        } catch (error) {
            console.error('No se pudieron cargar las mascotas:', error);
            this.mascotas = [];
        } finally {
            this.cargando = false;
        }
    }
    

    
}
