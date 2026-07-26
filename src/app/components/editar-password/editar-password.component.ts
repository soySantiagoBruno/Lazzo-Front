import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditarPasswordFormService } from '../../forms/editar-password-form.service';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { Auth } from 'firebase/auth';

@Component({
  selector: 'app-editar-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './editar-password.component.html',
  styleUrl: './editar-password.component.css'
})
export class EditarPasswordComponent {

  formularioEditarPassword: FormGroup;

  constructor(
    private editarPasswordFormService: EditarPasswordFormService,
    private userService: UserService,
    private router: Router,
    //private auth: Auth
  ){
    this.formularioEditarPassword = editarPasswordFormService.createEditarPasswordForm()
  }


  actualizarPassword(){
    this.userService.actualizarPassword(this.formularioEditarPassword)
    .then(response => {
      this.router.navigate(["/mascotas-adopcion"])
    }
    );

    console.log("enviando formulario...")
  }

}
