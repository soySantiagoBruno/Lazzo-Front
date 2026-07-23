import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SaberMasComponent } from './components/saber-mas/saber-mas.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PublicarMascotaComponent } from './components/publicar-mascota/publicar-mascota.component';
import { RegistrarUsuarioComponent } from './components/registrar-usuario/registrar-usuario.component';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RegistrarUsuarioGoogleComponent } from './components/registrar-usuario-google/registrar-usuario-google.component';
import { MyGuard } from './guards/my-guard';
import { LoginGuard } from './guards/login-guard';
import { EditarPerfilComponent } from './components/editar-perfil/editar-perfil.component';
import { EditarPasswordComponent } from './components/editar-password/editar-password.component';
import { CarruselComponent } from './components/carrusel/carrusel.component';
import { MascotasAdopcionComponent } from './components/mascotas-adopcion/mascotas-adopcion.component';
import { PublicarMascotaComponent as ModificarMascotaComponent } from './components/mascotas-adopcion/modificar-mascota/modificar-mascota.component';




export const routes: Routes = [

    // Secciones públicas
    {path: 'home', component: HomeComponent},
    {path: 'saber-mas', component: SaberMasComponent},
    
    // Secciones de logueo y registro
    {path: 'login', 
        component: LoginComponent,
        // Si ya estas logueado, mandalo al home-usuario
        canActivate: [LoginGuard],
    },
    {path: 'registrar-usuario', component: RegistrarUsuarioComponent},
    {path: 'registrar-usuario-google', component: RegistrarUsuarioGoogleComponent},
    
    // Secciones protegidas
    {path: 'mascotas-adopcion', 
        component: MascotasAdopcionComponent,
        canActivate:[MyGuard],
    }, //sección para dar en adopción (necesitas estar logueado)
    {
        path: 'publicar-mascota',
        component: PublicarMascotaComponent,
        canActivate:[MyGuard],
    },
    {
        path: 'modificar-mascota/:id',
        component: ModificarMascotaComponent,
        canActivate:[MyGuard],
    },

    {
        path: 'editar-perfil',
        component: EditarPerfilComponent,
        //canActivate:[MyGuard],
    },

    {
        path: 'editar-password',
        component: EditarPasswordComponent,
        //canActivate:[MyGuard],
    },

    
    // Redirecciones y página 404
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: '**', component: PageNotFoundComponent }
];
