import { Component, OnInit } from '@angular/core';

import { UserService } from '../../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, getDocs } from '@angular/fire/firestore';
import { collection, query, where } from "firebase/firestore";

import { log } from 'console';
import { UsuarioRegisterDto } from '../../../models/usuario-register-dto';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar-usuario',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './navbar-usuario.component.html',
  styleUrl: './navbar-usuario.component.css'
})
export class NavbarUsuarioComponent implements OnInit{

  usuarioActual?: UsuarioRegisterDto|null;


  constructor(
    private userService: UserService, 
    private router: Router,
    private firestore: Firestore
    
  ){
    
  }

  async ngOnInit(): Promise<void> {
    this.usuarioActual = await this.userService.getUsuario();
  }
  

  cerrarSesion(){
    this.userService.logout()
    .then((response) => {
      this.router.navigate(['/home']);
    })
    .catch(error => console.log(error))
  }

}
