export interface MascotaRegisterDto {
    uid?: string;
    departamento: string;
    descripcion: string;
    edad: string;
    nombre: string;
    provincia: string;
    sexo: string;
    tamanio: string;
    tipo: string;
    uidAdoptante: string; // Indica a que usuario pertenece
    urlImagen?: string;


    background?: string;
}
