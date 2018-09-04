import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private isLoggedIn = false;
  private isAdmin = false;
  private username = '';

  constructor(private loginService: LoginService, private alertService: AlertService,
    private router: Router) { }

  ngOnInit() {
    const userToken = localStorage.getItem('userToken');
    if (userToken !== null) {
      this.isLoggedIn = true;
      const loggedUser = JSON.parse(window.atob(userToken.split('.')[1]));
      const userRole = loggedUser.role[0].authority;
      if (userRole === '1') {
        this.isAdmin = true;
      }
      this.username = loggedUser.sub;
    }
  }

  logout() {
    this.loginService.logout(this.username).subscribe((res: any) => {
      if (res.success) {
        localStorage.removeItem('userToken');
        this.router.navigate(['']);
        this.alertService.success(res.message);
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
