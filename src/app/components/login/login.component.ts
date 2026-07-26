import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoginFormService } from '../../forms/login-form.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  formularioLogin: FormGroup;

  constructor(
    private loginFormService: LoginFormService, 
    private userService: UserService, 
    private router: Router
  ){
    // Creo el formulario a usar para el login
    this.formularioLogin = loginFormService.createLoginForm();
  }

  onSubmit(){
    this.userService.login(this.formularioLogin.value) // Le pasamos los VALORES del formulario necesarios para el registro
    .then(response => {
      // En caso de que el registro sea exitoso, redirije a       
      this.router.navigate(["/mascotas-adopcion"])
    
    })
    .catch(error => console.log(error))
  }

  loginWithGoogle(){
    this.userService.loginWithGoogle()
    .then(response => {
      // En caso de que el registro sea exitoso, redirije al login      
      //this.router.navigate(["/mascotas-adopcion"])
    })
      
  }

  
}
