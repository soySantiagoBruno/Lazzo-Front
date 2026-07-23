import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbars/navbar/navbar.component";
import { HomeComponent } from "./components/home/home.component";
import { FooterComponent } from "./components/footers/footer/footer.component";
import { InfoMascotaComponent } from "./components/info-mascota/info-mascota.component";

import { LoginComponent } from './components/login/login.component';
import { SaberMasComponent } from './components/saber-mas/saber-mas.component';
import { MascotasAdopcionComponent } from "./components/mascotas-adopcion/mascotas-adopcion.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, MascotasAdopcionComponent]
})
export class AppComponent {
  title = 'frontend-adoptapp';
}
