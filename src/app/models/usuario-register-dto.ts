import { MascotaRegisterDto } from "./pet-dto";

export interface UsuarioRegisterDto {
    uid?: string;
    nombreCompleto: string;
    urlImagenPerfil?: string;
    
    // Datos de contacto
    celular?: Number;
    email: string;
    tieneWhatsapp: boolean;

    provincia: string;
    departamento: string;

    password: string;
    
    mascotasEnAdopcion?: Array<String>; // Strings con el uuid de la/s mascota/s
}
