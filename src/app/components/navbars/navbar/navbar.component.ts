import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NgIf } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { UsuarioRegisterDto } from '../../../models/usuario-register-dto';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isAuthenticated: boolean = false;
  
  usuarioActual?: UsuarioRegisterDto|null;
  @ViewChild('modalNavbar') modalEl!: ElementRef;

  constructor(
    private userService: UserService, 
    private auth: Auth,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    this.usuarioActual = await this.userService.getUsuario();

    onAuthStateChanged(this.auth, (user) => {
      console.log('Navbar auth state changed:', user);
      this.isAuthenticated = !!user;
    });
  }
  
  cerrarSesion(){
    this.userService.logout()
    .then((response) => {
      this.router.navigate(['/home']);
    })
    .catch(error => console.log(error))
  }

  private hideModal(): void {
    const el = this.modalEl?.nativeElement;
    if (!el) return;
    const bootstrapAny = (window as any).bootstrap;
    if (bootstrapAny && bootstrapAny.Modal) {
      let instance = bootstrapAny.Modal.getInstance(el);
      if (!instance) instance = new bootstrapAny.Modal(el);
      instance.hide();
    } else {
      el.classList.remove('show');
      el.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }
  }

  private hideModalAndWait(): Promise<void> {
    const el = this.modalEl?.nativeElement;
    if (!el) return Promise.resolve();
    const bootstrapAny = (window as any).bootstrap;
    return new Promise((resolve) => {
      if (bootstrapAny && bootstrapAny.Modal) {
        const onHidden = () => resolve();
        el.addEventListener('hidden.bs.modal', onHidden, { once: true });
        let instance = bootstrapAny.Modal.getInstance(el);
        if (!instance) instance = new bootstrapAny.Modal(el);
        instance.hide();
      } else {
        el.classList.remove('show');
        el.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        // give the browser a tick to settle layout
        setTimeout(() => resolve(), 150);
      }
    });
  }

  async goToSection(fragment: string) {
    try {
      await this.hideModalAndWait();
      await this.router.navigate(['/home'], { fragment });
    } catch (e) {
      console.error(e);
    }
  }

  async goToLogin() {
    try {
      await this.hideModalAndWait();
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error(e);
    }
  }




  

}
