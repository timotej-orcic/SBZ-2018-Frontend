import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private loginForm: FormGroup;
  private submitted = false;

  constructor(private loginService: LoginService, private router: Router,
    private alertService: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
    });
  }

  get f() { return this.loginForm.controls; }

  login(user) {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loginService.login(user).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        setTimeout(() => {
          localStorage.setItem('userToken', res.payload);
          const loggedUser = JSON.parse(window.atob(res.payload.split('.')[1]));
          const userRole = loggedUser.role[0].authority;
          if ( userRole === '0') {
            this.router.navigate(['web-shop']);
          } else {
            this.router.navigate(['admin-panel']);
          }
        }, 1000);
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
