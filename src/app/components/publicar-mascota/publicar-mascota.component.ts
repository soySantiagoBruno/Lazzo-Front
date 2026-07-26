import { Component, OnInit } from '@angular/core';
import { FooterDarkComponent } from "../footers/footer-dark/footer-dark.component";
import { NavbarUsuarioComponent } from "../navbars/navbar-usuario/navbar-usuario.component";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PublicarMascotaFormService } from '../../forms/publicar-mascota-form.service';
import { UbicacionService } from '../../services/ubicacion.service';
import { NgForOf, NgIf } from '@angular/common';
import { MascotaService } from '../../services/mascota.service';
import { Router } from '@angular/router';
import { ProvinciaDto } from '../../models/provincia-dto';
import { DepartamentoDto } from '../../models/departamento-dto';

@Component({
  selector: 'app-publicar-mascota',
  standalone: true,
  imports: [FooterDarkComponent, NavbarUsuarioComponent, ReactiveFormsModule, NgForOf, NgIf],
  templateUrl: './publicar-mascota.component.html',
  styleUrl: './publicar-mascota.component.css'
})
export class PublicarMascotaComponent implements OnInit{

  publicarMascotaForm: FormGroup;

  // Esto será usado en el dropdown de ubicación
  provincias: ProvinciaDto[] = [];
  departamentos: DepartamentoDto[] = [];
  tocado: boolean = false;


  constructor(
    private mascotaService: MascotaService,
    private publicarMascotaFormService: PublicarMascotaFormService,
    private ubicacionService: UbicacionService,
    private router: Router
  ){
    this.publicarMascotaForm = publicarMascotaFormService.createPublicarMascotaForm();
  }


  ngOnInit(): void {
    this.cargarProvincias();
    this.desabilitarSelectMunicipio()
    }


  registrarMascota(){
    this.mascotaService.registrarMascota(this.publicarMascotaForm.value)
    .then(response=>{
      console.log("Registro exitoso")
      this.router.navigate(["/mascotas-adopcion"]) 
    })
    
  }


  cargarProvincias(): void{
    this.ubicacionService.getProvincias().subscribe((data: ProvinciaDto[]) =>{
      this.provincias = data
    })
  }

  cargarDepartamentos(provincia: string){
    // getDepartamentos returns all departamentos; filter by idProvincia
    this.ubicacionService.getDepartamentos().subscribe(data => {
      this.departamentos = (data || []).filter((d: any) => d.idProvincia === provincia || String(d.idProvincia) === String(provincia));
    });
  }

  desabilitarSelectMunicipio(){
    // Escuchar cambios en el campo de provincia
    this.publicarMascotaForm.get('provincia')?.valueChanges.subscribe(() => {
      const provinciaControl = this.publicarMascotaForm.get('provincia');
      
      if (provinciaControl?.dirty && provinciaControl.value) {
        // Habilitar el campo de departamento si la provincia fue modificada y tiene un valor
        this.publicarMascotaForm.get('departamento')?.enable();
        this.cargarDepartamentos(provinciaControl.value);
        this.tocado = true;
      } else {
        // Deshabilitar el campo de departamento si no se ha seleccionado una provincia
        this.publicarMascotaForm.get('departamento')?.disable();
      }
    });

    // Inicialmente deshabilitar el campo de departamento
    this.publicarMascotaForm.get('departamento')?.disable();
  }

}
