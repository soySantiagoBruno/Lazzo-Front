import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, getAuth, updateEmail, reauthenticateWithCredential, EmailAuthProvider, verifyBeforeUpdateEmail } from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { UsuarioRegisterDto } from '../models/usuario-register-dto';
import { Router, RouterLink } from '@angular/router';
import { UsuarioLogin } from '../models/usuario-login';
import { log } from 'console';
import { sendEmailVerification, updatePassword } from 'firebase/auth';
import { EditarPasswordFormService } from '../forms/editar-password-form.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) { }

  // Registrar usando authentication y storage (clásico) (pide todos los datos de una)
  registerUsuario(usuario: UsuarioRegisterDto) {
    const userRef = collection(this.firestore, 'usuarios');
    
    // Crear el usuario en Firebase Authentication sin usar Google
    return createUserWithEmailAndPassword(this.auth, usuario.email, usuario.password)
      .then((userCredential) => {
        // Agregar los datos adicionales a Firestore a la colección "usuarios"
        return addDoc(userRef, {
          uid: userCredential.user.uid, // Asociar los datos al UID del usuario
          nombreCompleto: usuario.nombreCompleto,
          celular: usuario.celular,
          email: usuario.email,
          provincia: usuario.provincia,
          departamento: usuario.departamento,
          tieneWhatsapp: usuario.tieneWhatsapp,
          mascotasEnAdopcion: usuario.mascotasEnAdopcion || [] // Si no se especifican mascotas, guardar un array vacío
        });
      })
      .catch((error) => {
        console.error("Error al registrar el usuario:", error);
        throw error; // Propagar el error para que pueda ser manejado por quien llama a esta función
      });
  }

  login({email, password}: UsuarioLogin){
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  userCredential: any;
  // Crear usuario con google ó iniciar sesión si ya existe
  loginWithGoogle(){
    const userRef = collection(this.firestore, 'usuarios');

    // Popup Google
    return signInWithPopup(this.auth, new GoogleAuthProvider())
    .then(async (userCredential) => {
      
      // Una vez logueados con Google, SI NO estamos registrados en la colección "usuarios" nos vamos al registro-usuario-google
      const uidUserActual = this.auth.currentUser?.uid;
      if (!uidUserActual) {
        console.error('loginWithGoogle: no se obtuvo el uid del usuario autenticado');
        return;
      }
      
      // Realizar la consulta en Firestore
      const q = query(collection(this.firestore, 'usuarios'), where("uid", "==", uidUserActual));
      const querySnapshot = await getDocs(q);

      // Verificar si el documento existe en Firestore
      if (!querySnapshot.empty) {
          console.log("El usuario existe en la colección 'usuarios'");
          this.router.navigate(['/mascotas-adopcion']);
          
      } else {
          console.log("El usuario no está registrado en la colección 'usuarios'");
          // Procedemos a mandarlo al formulario de registrar-usuario-google
          //Primero guardamos las credenciales en una variable para ser usado por registerUsuarioGoogle()
          this.userCredential = userCredential;
          
          this.router.navigate(['/registrar-usuario-google']);
          
      }

    
    })
  }


  // Función que termina de armar el registro de un usuario registrado mediante Google
  // loginWithGoogle() -> después usamos registerUsuarioGoogle() en /registrar-usuario-google
  registerUsuarioGoogle(usuario: any) {
    // Coleccion usuario en Firestore
    const userRef = collection(this.firestore, 'usuarios');
    
    // Crear el usuario en Firebase Authentication usando Google
    // NO NECESITAMOS agregarlo al Authentication solo al Firebase Database
    // Agregar los datos adicionales a Firestore a la colección "usuarios"
    //console.log(`uid cargado con el popup ${this.userCredential.user.uid}`);
    //console.log(`email cargado con el popup ${this.userCredential.user.email}`);
    
    return addDoc(userRef, {
      // Datos traidos del Popup de Google
      uid: this.userCredential.user.uid, // Asociar los datos al UID del usuario
      email: this.userCredential.user.email , // el email va a ser el que le pasa google
      
      // Datos traidos del /registrar-usuario-google
      nombreCompleto: usuario.nombreCompleto,
      celular: usuario.celular,
      provincia: usuario.provincia,
      departamento: usuario.departamento,
      tieneWhatsapp: usuario.tieneWhatsapp,
      mascotasEnAdopcion: usuario.mascotasEnAdopcion || [] // Si no se especifican mascotas, guardar un array vacío
    });
      
  }
  

  async actualizarUsuario(usuario: any){
    const auth = getAuth();
    const user = auth.currentUser;

    
    if (!user) {
      throw new Error('No se encontró al usuario autenticado.');
    }

    let uidUserActual = user.uid;
    
    // Armamos la referencia para hacer la query
    const userRef = collection(this.firestore, 'usuarios');

    // Armamos la query para buscar el documento donde el campo 'uid' sea igual al uidUserActual
    const q = query(userRef, where('uid', '==', uidUserActual));

    // Obtenemos los documentos que coincidan con la consulta
    const querySnapshot = await getDocs(q);

    // Asumimos que hay un solo documento que coincide con el UID
    const userDoc = querySnapshot.docs[0]; // Obtenemos el primer documento
    const userDocId = userDoc.id; // Obtenemos el ID del documento

    // Referencia al DOCUMENTO DEL USUARIO que nos trajimos con la querySnapshot
    const userDocRef = doc(this.firestore, `usuarios/${userDocId}`); 

    // Ahora actualizamos ese documento específico con los datos que traemos del formulario
    return updateDoc(userDocRef, {
      // Datos traidos del usuario authenticado actualmente
      uid: uidUserActual, // Asociar los datos al UID del usuario
      
      // Datos traidos del formulario
      nombreCompleto: usuario.nombreCompleto,
      celular: usuario.celular,
      provincia: usuario.provincia,
      departamento: usuario.departamento,
      tieneWhatsapp: usuario.tieneWhatsapp,
    });
  }


  async actualizarPassword(editarPasswordForm: any){
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No se encontró al usuario autenticado.');
    }


    // 1. vuelvo a pedir la credencial (para poder reautenticar)
    const credential = EmailAuthProvider.credential(user.email as string, editarPasswordForm.currentPassword)

    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, editarPasswordForm.newPassword)
  }



  // Me traigo un usuario a partir del UID
  async getUsuario(): Promise<UsuarioRegisterDto | null>{
    
    const uidUserActual = this.auth.currentUser?.uid;
    if (!uidUserActual) {
      console.warn('getUsuario: no hay usuario autenticado, no se realiza la consulta Firestore');
      return null;
    }

    const userRef = collection(this.firestore, "usuarios");

    const usuarioTraido: UsuarioRegisterDto = {
      nombreCompleto: '',
      celular: undefined,
      email: '',
      provincia: '',
      departamento: '',
      tieneWhatsapp: false,
      password: '',
      urlImagenPerfil:''
    };

    // Realizar la consulta Firestore
    const q = query(userRef, where("uid", "==", uidUserActual));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      usuarioTraido.provincia = doc.data()['provincia']
      usuarioTraido.departamento = doc.data()['departamento']
      usuarioTraido.nombreCompleto = doc.data()['nombreCompleto']
      usuarioTraido.celular = doc.data()['celular']
      usuarioTraido.tieneWhatsapp = doc.data()['tieneWhatsapp']
      usuarioTraido.email = doc.data()['email']
      usuarioTraido.mascotasEnAdopcion = doc.data()['mascotasEnAdopcion']

    });

    // Si es un usuario logueado con google, aparte traeme la foto de perfil
    if(this.auth.currentUser){
      usuarioTraido.urlImagenPerfil = this.auth.currentUser.photoURL?.replace('s96-c', 's400-c');
    }

    return usuarioTraido;
  }
  

  logout(){
    return signOut(this.auth);
  }


  async obtenerIdUsuarioDocumento() {
    const user = this.auth.currentUser;

    if (user) {
      const uid = user.uid; // Obtiene el UID del usuario autenticado
      
      // Realiza una consulta para encontrar el documento en Firestore
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', uid)); // Asegúrate de tener el campo 'uid' en tus documentos

      const querySnapshot = await getDocs(q);
      let documentId = '';

      querySnapshot.forEach((doc) => {
        documentId = doc.id; // Obtiene el ID del documento
      });

      return documentId; // Devuelve el ID del documento
    } else {
      console.error('No hay usuario autenticado');
      return null;
    }
  }


}
