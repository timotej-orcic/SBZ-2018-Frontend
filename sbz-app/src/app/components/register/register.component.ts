import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { PasswordValidator } from '../../validators/password-validator';
import { ConfirmValidParentMatcher } from '../../validators/confirm-valid-parent-matcher';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  private confirmValidParentMatcher = new ConfirmValidParentMatcher();
  private registerForm: FormGroup;
  private submitted: boolean;

  constructor(private registerService: RegisterService, private router: Router,
    private alertService: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('[A-Z][a-z]{1,49}')]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern('[A-Z][a-z]{1,49}')]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(80)]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: PasswordValidator.MatchPassword.bind(this)});
  }

  get f() { return this.registerForm.controls; }

  register(user) {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    this.registerService.register(user).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        setTimeout(() => {
          this.router.navigate(['']);
        }, 1000);
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
