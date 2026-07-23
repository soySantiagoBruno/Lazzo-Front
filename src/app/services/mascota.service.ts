import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { MascotaRegisterDto } from '../models/pet-dto';
import { arrayUnion, Firestore } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  constructor(
    private firestore: Firestore, 
    private router: Router, 
    private auth: Auth,
    private userService: UserService
  ) { }

  async registrarMascota(nuevaMascota: MascotaRegisterDto){ 
    
    // 1. Agregamos la mascota al documento "mascotas"
    const mascotaRef = collection(this.firestore, 'mascotas');

    // Cuando usas addDoc, este método devuelve una referencia del documento creado que incluye el ID (que voy a usar en el updateDoc)
    const docRef = await addDoc(mascotaRef, {
      // Asociados al usuario que realiza la publicación
      //uidAdoptante: userCredential.user.uid,
      //celular: usuario.celular,
      //email: usuario.email,

      tipo: nuevaMascota.tipo,
      nombre: nuevaMascota.nombre,
      sexo: nuevaMascota.sexo,
      tamanio: nuevaMascota.tamanio,
      edad: nuevaMascota.edad,
      provincia: nuevaMascota.provincia,
      departamento: nuevaMascota.departamento,
      descripcion: nuevaMascota.descripcion,
      urlImagen: nuevaMascota.urlImagen,
      uidAdoptante: this.auth.currentUser?.uid
    });


    // 2. Agregamos la mascota a la lista de mascotas del usuario en cuestión
    
    // Traigo el id del documento del usuario actual que se encuentra en "usuarios", para ello  hago una query que usa el uid del usuario para traer un documento
    const documentId = await this.userService.obtenerIdUsuarioDocumento();

    const userRef = doc(this.firestore, 'usuarios', documentId as string);
    
    await updateDoc(userRef, {
      mascotasEnAdopcion: arrayUnion(docRef.id) //ID del documento mascota que acabo de agregar
    });

  }

  async obtenerMascota(id: string): Promise<MascotaRegisterDto | null> {
    const mascotaSnapshot = await getDoc(doc(this.firestore, 'mascotas', id));

    if (!mascotaSnapshot.exists()) {
      return null;
    }

    return {
      uid: mascotaSnapshot.id,
      ...mascotaSnapshot.data()
    } as MascotaRegisterDto;
  }

  async obtenerMascotas(): Promise<MascotaRegisterDto[]> {
    const uidUsuarioActual = this.auth.currentUser?.uid;

    console.log('UID del usuario actual:', uidUsuarioActual);

    if (!uidUsuarioActual) {
      console.error('No se pudo obtener el UID del usuario actual.');
      return [];
    }

    const mascotasQuery = query(
      collection(this.firestore, 'mascotas'),
      where('uidAdoptante', '==', uidUsuarioActual)
    );
    const mascotasSnapshot = await getDocs(mascotasQuery);

    return mascotasSnapshot.docs.map((mascotaSnapshot) => ({
      uid: mascotaSnapshot.id,
      ...mascotaSnapshot.data()
    } as MascotaRegisterDto));
  }

  async actualizarMascota(id: string, cambios: Partial<MascotaRegisterDto>): Promise<void> {
    const { uid, uidAdoptante, ...datosActualizables } = cambios;
    await updateDoc(doc(this.firestore, 'mascotas', id), datosActualizables);
  }

}
