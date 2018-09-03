import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private isLoggedIn = false;
  private isAdmin = false;
  private username = '';
  constructor(private loginService: LoginService) { }

  ngOnInit() {
    const userToken = localStorage.getItem('userToken');
    if (userToken !== null) {
      this.isLoggedIn = true;
      const loggedUser = JSON.parse(window.atob(userToken.split('.')[1]));
      const userRole = loggedUser.role[0].authority;
      if (userRole === '1') {
        this.isAdmin = true;
      }
      this.username = loggedUser.subject;
    }
  }

  logout() {
    this.loginService.logout(this.username);
  }
}
