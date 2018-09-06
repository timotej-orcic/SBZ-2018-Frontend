import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Product } from '../../models/product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  private products = [];
  private productForm: FormGroup;
  private submitted: boolean;
  private editing: boolean;
  private editingImage: boolean;
  private isFileAttached: boolean;
  private fileSelected: File;

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
            res.payload.forEach(element => {
              const resProduct = new Product(element.id, element.name, element.manufactorer,
                element.description, element.price, element.warrantyInMonths);
              const resFile = new DisplayFile(element.base64Image.id, element.base64Image.name,
                element.base64Image.type, element.base64Image.imageBytes);
              this.products.push(new DisplayProduct(resProduct, resFile));
            });
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
    });
  }

  get f() { return this.productForm.controls; }

  onFileChange(event) {
    this.fileSelected = event.target.files[0];
    this.isFileAttached = true;
  }

  postForm(product: Product) {
    this.submitted = true;

    if (this.productForm.invalid || !this.isFileAttached) {
      return;
    }

    this.smartModalService.close('addProductModal');
    this.crudService.addProduct(product, this.fileSelected).pipe(first())
      .subscribe((res: any) => {
        if (res.success) {
          this.alertService.success(res.message);
          const resProduct = new Product(res.payload.name, res.payload.manufactorer, res.payload.id,
            res.payload.description, res.payload.price, res.payload.warrantyInMonths);
          const resFile = new DisplayFile(res.payload.base64Image.id, res.payload.base64Image.name,
            res.payload.base64Image.type, res.payload.base64Image.imageBytes);
          this.products.push(new DisplayProduct(resProduct, resFile));
        } else {
          this.alertService.error(res.message);
        }
      });
    this.submitted = false;
  }

  generateEditModal(productId: number) {
    const selectedProduct = this.products.find(x => x.product.id === productId);
    if (selectedProduct !== null) {
      this.editing = true;
      /*setup form*/
      this.f.name = selectedProduct.name;
      this.f.manufactorer = selectedProduct.manufactorer;
      this.f.description = selectedProduct.description;
      this.f.price = selectedProduct.price;
      this.f.warrantyInMonths = selectedProduct.warrantyInMonths;
      /*end setup form*/
      this.smartModalService.getModal('productModal').open();
    } else {
      this.alertService.error('Selection error, please try again');
    }
  }

  editImage(event) {
    if (event.target.checked) {
      this.editingImage = true;
    } else {
      this.editingImage = false;
    }
  }

  closeModal() {
    this.smartModalService.getModal('productModal').close();
    setTimeout(() => {
      this.submitted = false;
      this.editing = false;
      this.editingImage = false;
    }, 500);
  }
}
