import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../footers/footer/footer.component";
import { CarruselComponent } from "../carrusel/carrusel.component";
import { NavbarComponent } from "../navbars/navbar/navbar.component";
import { FiltroComponent } from '../filtro/filtro.component';
import { AboutComponent } from "../about/about.component";
import { NavbarUsuarioComponent } from "../navbars/navbar-usuario/navbar-usuario.component";
import { UsuarioRegisterDto } from '../../models/usuario-register-dto';
import { UserService } from '../../services/user.service';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [FooterComponent, CarruselComponent, FiltroComponent, NavbarComponent, AboutComponent, NavbarUsuarioComponent]
})
export class HomeComponent implements OnInit {

    estaAutenticado = false;
    
    constructor(
        private userService: UserService,
        private auth: Auth
    ){}

    async ngOnInit(): Promise<void> {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.estaAutenticado = true;
                console.log("El usuario ha iniciado sesión:", this.estaAutenticado);
            } else {
                this.estaAutenticado = false;
                console.log("No hay usuario activo:", this.estaAutenticado);
            }
        });
    }

}