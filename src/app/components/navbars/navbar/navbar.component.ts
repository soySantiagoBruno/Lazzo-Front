import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isAuthenticated: boolean = false;

  constructor(
    private userService: UserService, 
  ) {}

  async ngOnInit(): Promise<void> {

    console.log("NavbarComponent ngOnInit called");    
    console.log(await this.userService.getUsuario());

    // controla si se van a mostrar en el DOM los li "login" y "ver mis mascotas publicadas" dependiendo si el usuario está logueado o no.
    if (await this.userService.getUsuario()){
      this.isAuthenticated = true;
      console.log("Usuario logueado, mostrando 'ver mis mascotas publicadas'");
    }
  }
  

}
