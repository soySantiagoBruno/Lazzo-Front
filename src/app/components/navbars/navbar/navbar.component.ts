import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { NgIf } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  isAuthenticated: boolean = false;

  constructor(
    private auth: Auth
  ) {}

  ngOnInit(): void {
    console.log("NavbarComponent ngOnInit called");

    onAuthStateChanged(this.auth, (user) => {
      console.log('Navbar auth state changed:', user);
      this.isAuthenticated = !!user;
    });
  }
  

}
