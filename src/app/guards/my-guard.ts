import { inject } from '@angular/core';
import { Auth, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { CanActivateFn, Router } from "@angular/router";

export const MyGuard: CanActivateFn = async () => {

    const firestore = inject(Firestore);
    const router = inject(Router);
    const auth = getAuth();


    /*
     *Nota sobre el uso de onAuthStateChanged 
     * After refresh, firebase Auth current user returns null!
     * 
     * When you navigate to a new page, you're reloading the Firebase Authentication SDK. At this point Firebase automatically refreshes the authentication state of the current user, but this may require a roundtrip to the server. And by the time your `firebase.auth().currentUser runs that refresh apparently isn't done yet.  
    * For this reason you should use onAuthStateChange to listen for changes
    */


    return new Promise((resolve) => {
        // Esperar el estado de autenticación
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log("No se encontró un usuario autenticado");
                router.navigate(['/login']);
                return resolve(false);
            }

            // Obtener el uid del usuario actual
            const uidUserActual = user.uid;
            if (!uidUserActual) {
                console.error('MyGuard: UID inválido');
                router.navigate(['/login']);
                return resolve(false);
            }

            try {
              // Realizar la consulta en Firestore
              const q = query(collection(firestore, 'usuarios'), where("uid", "==", uidUserActual));
              const querySnapshot = await getDocs(q);

              // Verificar si el documento existe en Firestore
              if (!querySnapshot.empty) {
                  console.log("El usuario existe en la colección 'usuarios'");
                  return resolve(true); // Permitir el acceso
              } else {
                  console.log("El usuario no está registrado en la colección 'usuarios'");
                  router.navigate(['/login']);
                  return resolve(false);
              }
            } catch (error) {
              console.error('MyGuard: error al consultar Firestore', error);
              router.navigate(['/login']);
              return resolve(false);
            }
        });
    });

    // Se podría implementar una pantalla de carga para evitar el parpadero que muestra el login al recargar la paginad e mascotas-adopcion por ejemplo.
};
