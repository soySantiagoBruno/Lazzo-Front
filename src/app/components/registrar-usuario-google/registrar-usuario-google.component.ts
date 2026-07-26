import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterFormGoogleService as RegisterFormGoogleService } from '../../forms/register-form-google.service';
import { UserService } from '../../services/user.service';
import { NgFor, NgIf } from '@angular/common';
import { UbicacionService } from '../../services/ubicacion.service';
import { ProvinciaDto } from '../../models/provincia-dto';
import { DepartamentoDto } from '../../models/departamento-dto';

@Component({
  selector: 'app-registrar-usuario-google',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './registrar-usuario-google.component.html',
  styleUrl: './registrar-usuario-google.component.css'
})

/* Esto sirve para terminar de completar el registro de un usuario que se loguea mediante Google, esto debido a que además de un correo (que nos proporciona Google), también necesitamos otros datos como nombre, celular, provincia y departamento.
 */
export class RegistrarUsuarioGoogleComponent {

  // Esto será usado en el dropdown de ubicación
  provincias: ProvinciaDto[] = [];
  departamentos: DepartamentoDto[] = [];
  departamentosFiltrados: any[] = []; // <- lista filtrada por provincia
  
  tocado: boolean = false;

  formularioRegisterGoogle: FormGroup;


  constructor(
    private registerFormGoogleService: RegisterFormGoogleService, 
    private userService: UserService, 
    private router: Router,
    private ubicacionService: UbicacionService,
  ){
    // Creo el formulario a usar para el registro
    this.formularioRegisterGoogle = registerFormGoogleService.createRegisterGoogleForm();
  }

   ngOnInit(): void {
    this.cargarProvincias();
    this.desabilitarSelectMunicipio()
  }

  onSubmit(){
    // Convertir el valor de "tieneWhatsapp" a booleano (true o false) para ser cargado en el sistema
    if (this.formularioRegisterGoogle.value.tieneWhatsapp === "true") {
      this.formularioRegisterGoogle.value.tieneWhatsapp = true; 
    } else if(this.formularioRegisterGoogle.value.tieneWhatsapp === "false"){
      this.formularioRegisterGoogle.value.tieneWhatsapp = false; 
    }

    
    this.userService.registerUsuarioGoogle(this.formularioRegisterGoogle.value) // Le pasamos los VALORES del formulario necesarios para el registro
    .then(response => {      
      // En caso de que el registro sea exitoso, redirije al /mascotas-adopcion
      this.router.navigate(["/mascotas-adopcion"])
    })

    .catch(error => console.log(error))
  }


  private cargarProvincias() {
    this.ubicacionService.getProvincias().subscribe(p => this.provincias = p || []);
  }

  private cargarDepartamentos() {
    this.ubicacionService.getDepartamentos().subscribe(d => {
      this.departamentos = d || [];
      const currentProv = this.formularioRegisterGoogle.get('provincia')?.value;
      this.applyProvinciaFilter(currentProv);
    });
  }

  private suscribirFiltroProvincia() {
    this.formularioRegisterGoogle.get('provincia')?.valueChanges.subscribe(provId => this.applyProvinciaFilter(provId));
  }


  applyProvinciaFilter(provId: string | null | undefined) {
    const departamentoControl = this.formularioRegisterGoogle.get('departamento');

    if (provId) {
      // habilita y filtra por idProvincia
      departamentoControl?.enable();
      this.departamentosFiltrados = this.departamentos.filter(d => d.idProvincia === provId || d.idProvincia === String(provId));
    } else {
      // si viene vacío, deshabilita y vacía
      departamentoControl?.reset();
      departamentoControl?.disable();
      this.departamentosFiltrados = [];
    }
  }


  desabilitarSelectMunicipio(){
    // Escuchar cambios en el campo de provincia
    this.formularioRegisterGoogle.get('provincia')?.valueChanges.subscribe(() => {
      const provinciaControl = this.formularioRegisterGoogle.get('provincia');
      
      if (provinciaControl?.dirty && provinciaControl.value) {
        // Habilitar el campo de departamento si la provincia fue modificada y tiene un valor
        this.formularioRegisterGoogle.get('departamento')?.enable();
        this.cargarDepartamentos();
        this.tocado = true;
      } else {
        // Deshabilitar el campo de departamento si no se ha seleccionado una provincia
        this.formularioRegisterGoogle.get('departamento')?.disable();
      }
    });

    // Inicialmente deshabilitar el campo de departamento
    this.formularioRegisterGoogle.get('departamento')?.disable();
  }

}