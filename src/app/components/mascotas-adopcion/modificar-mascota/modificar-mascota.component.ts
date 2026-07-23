import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterDarkComponent } from "../../footers/footer-dark/footer-dark.component";
import { NavbarUsuarioComponent } from "../../navbars/navbar-usuario/navbar-usuario.component";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PublicarMascotaFormService } from '../../../forms/publicar-mascota-form.service';
import { UbicacionService } from '../../../services/ubicacion.service';
import { NgForOf, NgIf } from '@angular/common';
import { MascotaService } from '../../../services/mascota.service';
import { ProvinciaDto } from '../../../models/provincia-dto';
import { DepartamentoDto } from '../../../models/departamento-dto';
import { MascotaRegisterDto } from '../../../models/pet-dto';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-publicar-mascota',
  standalone: true,
  imports: [FooterDarkComponent, NavbarUsuarioComponent, ReactiveFormsModule, NgForOf, NgIf, RouterLink],
  templateUrl: './modificar-mascota.component.html',
  styleUrl: './modificar-mascota.component.css'
})
export class PublicarMascotaComponent implements OnInit{

  publicarMascotaForm: FormGroup;

  // Esto será usado en el dropdown de ubicación
  provincias: ProvinciaDto[] = [];
  departamentos: DepartamentoDto[] = [];
  tocado: boolean = false;
  mascotaId = '';
  cargando = true;
  guardando = false;
  imagenPreview = '';


  constructor(
    private mascotaService: MascotaService,
    private publicarMascotaFormService: PublicarMascotaFormService,
    private ubicacionService: UbicacionService,
    private router: Router,
    private route: ActivatedRoute
  ){
    this.publicarMascotaForm = publicarMascotaFormService.createPublicarMascotaForm();
  }


  async ngOnInit(): Promise<void> {
    this.desabilitarSelectMunicipio();
    this.mascotaId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.cargarProvincias();
    await this.cargarMascota();
  }

  // Esto carga la mascota en el formulario para que el usuario pueda modificarla. Si no se encuentra la mascota, redirige al usuario a la página de mascotas en adopción.
  async cargarMascota(): Promise<void> {
    if (!this.mascotaId) {
      await this.router.navigate(['/mascotas-adopcion']);
      return;
    }

    try {
      const mascota: MascotaRegisterDto|null = await this.mascotaService.obtenerMascota(this.mascotaId);

      console.log(mascota);

      if (!mascota) {
        console.error('Mascota no encontrada');
        await this.router.navigate(['/mascotas-adopcion']);
        return;
      }

      const mascotaNormalizada = {
        ...mascota,
        tamanio: this.normalizarTamanio(mascota.tamanio),
        edad: this.normalizarEdad(mascota.edad),
        provincia: String(mascota.provincia ?? '').trim(),
        departamento: String(mascota.departamento ?? '').trim(),
        urlImagen: mascota.urlImagen ?? ''
      };

      this.imagenPreview = mascota.urlImagen ?? '';
      this.publicarMascotaForm.patchValue(mascotaNormalizada, { emitEvent: false });

      const provinciaId = this.resolverProvinciaId(mascotaNormalizada.provincia);
      const departamentos = await this.obtenerDepartamentosByProvincia(provinciaId);

      this.departamentos = departamentos;
      const departamentoId = this.resolverDepartamentoId(mascotaNormalizada.departamento, provinciaId, departamentos);

      this.tocado = true;
      this.publicarMascotaForm.get('provincia')?.setValue(provinciaId, { emitEvent: false });
      this.publicarMascotaForm.get('departamento')?.setValue(departamentoId, { emitEvent: false });
      this.publicarMascotaForm.get('departamento')?.enable();
    } finally {
      this.cargando = false;
    }
  }

  async actualizarMascota(): Promise<void> {
    if (this.publicarMascotaForm.invalid || this.guardando) {
      this.publicarMascotaForm.markAllAsTouched();
      return;
    }

    this.guardando = true;

    try {
      await this.mascotaService.actualizarMascota(this.mascotaId, this.publicarMascotaForm.getRawValue());
      await this.router.navigate(['/mascotas-adopcion']);
    } finally {
      this.guardando = false;
    }
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.imagenPreview = result;
      this.publicarMascotaForm.get('urlImagen')?.setValue(result);
    };

    reader.readAsDataURL(archivo);
  }


  private normalizarTamanio(valor?: string): string {
    const normalizado = (valor ?? '').toString().trim().toLowerCase();

    switch (normalizado) {
      case 'chico':
        return 'Chico';
      case 'mediano':
        return 'Mediano';
      case 'grande':
        return 'Grande';
      default:
        return valor?.trim() ?? '';
    }
  }

  private normalizarEdad(valor?: string): string {
    const normalizado = (valor ?? '').toString().trim().toLowerCase();

    switch (normalizado) {
      case '1':
      case 'cachorros':
        return 'Cachorros';
      case '2':
      case 'jovenes (2-4 años)':
      case 'jovenes (2 a 4 años)':
        return 'Jovenes (2-4 años)';
      case '3':
      case 'adultos (5-9 años)':
        return 'Adultos (5-9 años)';
      case '4':
      case 'viejitos (+10 años)':
      case 'viejitos (10+ años)':
        return 'Viejitos (+10 años)';
      default:
        return valor?.trim() ?? '';
    }
  }

  private resolverProvinciaId(valor: string): string {
    const valorNormalizado = valor?.trim() ?? '';

    const provinciaEncontrada = this.provincias.find((provincia) =>
      provincia.id === valorNormalizado || provincia.nombre.toLowerCase() === valorNormalizado.toLowerCase()
    );

    return provinciaEncontrada?.id ?? valorNormalizado;
  }

  private resolverDepartamentoId(valor: string, provinciaId: string, departamentos: DepartamentoDto[]): string {
    const valorNormalizado = valor?.trim() ?? '';

    const departamentoEncontrado = departamentos.find((departamento) =>
      departamento.id === valorNormalizado ||
      departamento.nombre.toLowerCase() === valorNormalizado.toLowerCase() ||
      (departamento.idProvincia === provinciaId && departamento.nombre.toLowerCase() === valorNormalizado.toLowerCase())
    );

    return departamentoEncontrado?.id ?? valorNormalizado;
  }

  async cargarProvincias(): Promise<void> {
    const data = await firstValueFrom(this.ubicacionService.getProvincias());
    this.provincias = data || [];
  }

  async cargarDepartamentos(provincia: string): Promise<void> {
    this.departamentos = await this.obtenerDepartamentosByProvincia(provincia);
  }

  private async obtenerDepartamentosByProvincia(provincia: string): Promise<DepartamentoDto[]> {
    const data = await firstValueFrom(this.ubicacionService.getDepartamentos());
    return (data || []).filter((d: any) => d.idProvincia === provincia || String(d.idProvincia) === String(provincia));
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
