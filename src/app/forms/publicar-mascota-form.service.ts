import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PublicarMascotaFormService {

  createPublicarMascotaForm(): FormGroup {
    return new FormGroup({
      tipo: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [Validators.required]),
      sexo: new FormControl('', [Validators.required]),
      tamanio: new FormControl('', [Validators.required]),
      edad: new FormControl('', [Validators.required]),
      provincia: new FormControl('', [Validators.required]),
      departamento: new FormControl('', [Validators.required]), // <-- rename departamento -> departamento
      descripcion: new FormControl('', [Validators.required]),
      urlImagen: new FormControl(''),
      uidAdoptante: new FormControl('', [Validators.required]),      
    });
  }

}