import { inject } from "@angular/core";
import { Auth, onAuthStateChanged } from "@angular/fire/auth";
import { collection, Firestore, getDocs, query, where } from "@angular/fire/firestore";
import { Router } from "@angular/router";

export const LoginGuard = () => {
  const authService = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    // Usar onAuthStateChanged para esperar el estado de autenticación
    const unsubscribe = onAuthStateChanged(authService, async (user) => {
      if (!user) {
        // No hay usuario autenticado
        console.log("No se encontró un usuario autenticado");
        unsubscribe(); // Desuscribir para evitar múltiples llamadas
        return resolve(true); // Permitir acceso a la ruta de login
      }

      // Usuario autenticado, obtener el UID
      const uidUserActual = user.uid;
      console.log("uiduseractual: ", uidUserActual);

      if (!uidUserActual) {
        console.error('LoginGuard: UID inválido');
        unsubscribe();
        return resolve(true);
      }

      try {
        // Realizar la consulta en Firestore
        const q = query(collection(firestore, 'usuarios'), where("uid", "==", uidUserActual));
        const querySnapshot = await getDocs(q);

        // Si el usuario está registrado en 'usuarios', redirigir a mascotas-adopcion
        if (!querySnapshot.empty) {
          console.log("El usuario ya está registrado en Firestore");
          router.navigate(['/mascotas-adopcion']);
          unsubscribe(); // Desuscribir para evitar múltiples llamadas
          return resolve(false); // No permitir acceso a la ruta de login
        } else {
          // El usuario no está registrado, permitir acceso al login
          console.log("El usuario no está registrado en la colección 'usuarios'");
          unsubscribe(); // Desuscribir para evitar múltiples llamadas
          return resolve(true); // Permitir acceso a la ruta de login
        }
      } catch (error) {
        console.error('LoginGuard: error al consultar Firestore', error);
        unsubscribe();
        return resolve(true);
      }
    });
  });
};
