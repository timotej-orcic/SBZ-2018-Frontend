import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Product } from '../../models/product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  private products = [];
  private productForm: FormGroup;
  private submitted: boolean;
  private fileToUpload: File = null;

  constructor(private smartModalService: NgxSmartModalService, private crudService: CrudService,
    private router: Router, private alertService: AlertService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    const userToken = localStorage.getItem('userToken');
    if (userToken !== null) {
      const loggedUser = JSON.parse(window.atob(userToken.split('.')[1]));
      const userRole = loggedUser.role[0].authority;
      if (userRole === '1') {
        this.crudService.getProducts().subscribe((res: any) => {
          if (res.success) {
            this.products = res.payload;
          }
        });
        this.buildForm();
      } else {
        this.router.navigate(['']);
        this.alertService.error('You are not authorezed for this page');
      }
    } else {
      this.router.navigate(['']);
      this.alertService.error('You are not signed in');
    }
  }

  buildForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      manufactorer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(300)]],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern('((0|([1-9]\d*)){1,10})(\.\d{1,4})?')]],
      warrantyInMonths: ['', [Validators.required, Validators.min(0), Validators.pattern('(0|[1-9][0-9]*)')]],
      image: ['', [Validators.required]]
    });
  }

  get f() { return this.productForm.controls; }

  onFileChange(event) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        let res = reader.result;
        res = res.toString().split(',')[1];
        this.productForm.get('image').setValue({
          filename: file.name,
          filetype: file.type,
          value: res
        });
      };
    }
  }

  postForm(product: Product) {
    this.submitted = true;

    if (this.productForm.invalid) {
      return;
    }

    this.crudService.addProduct(product).pipe(first())
      .subscribe((res: any) => {
        if (res.success) {
          this.alertService.success(res.message);
          this.products.push(res.payload);
        } else {
          this.alertService.error(res.message);
        }
      });
  }
}
