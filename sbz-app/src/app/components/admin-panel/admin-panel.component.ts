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
import { ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('imageInput')
  myInputVariable: ElementRef;

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
              const resProduct = new Product(element.id, element.type, element.manufactorer,
                element.description, element.price, element.warrantyInMonths);
              const resFile = new DisplayFile(element.base64Image.id, element.base64Image.name,
                element.base64Image.type, element.base64Image.imageBytes);
              this.products.push(new DisplayProduct(resProduct, resFile));
            });
          }
        });
        this.buildForm();
        this.editingImage = false;
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
      id: [''],
      type: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      manufactorer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(300)]],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^((0|([1-9]\d*)){1,10})(\.\d{1,4})?$/)]],
      warrantyInMonths: ['', [Validators.required]],
    });
  }

  get f() { return this.productForm.controls; }

  onFileChange(event) {
    this.fileSelected = event.target.files[0];
    this.isFileAttached = true;
  }

  postForm(product: Product) {
    this.submitted = true;

    if (this.productForm.invalid || (!this.isFileAttached && !this.editing) ||
      (!this.isFileAttached && this.editingImage)) {
      return;
    }

    this.smartModalService.close('productModal');
    if (this.editing) {
      this.crudService.editProduct(product, this.fileSelected).pipe(first())
        .subscribe((res: any) => {
          if (res.success) {
            this.alertService.success(res.message);
            const displayProduct = this.products.find(x => x.product.id === res.payload.id);
            if (displayProduct !== null) {
              displayProduct.product.type = res.payload.type;
              displayProduct.product.manufactorer = res.payload.manufactorer;
              displayProduct.product.description = res.payload.description;
              displayProduct.product.price = res.payload.price;
              displayProduct.product.warrantyInMonths = res.payload.warrantyInMonths;
              displayProduct.image = new DisplayFile(res.payload.base64Image.id, res.payload.base64Image.name,
                res.payload.base64Image.type, res.payload.base64Image.imageBytes);
            } else {
              this.alertService.error('Error while fetching updated product, please reload the page');
            }
          } else {
            this.alertService.error(res.message);
          }
        });
    } else {
      this.crudService.addProduct(product, this.fileSelected).pipe(first())
      .subscribe((res: any) => {
        if (res.success) {
          this.alertService.success(res.message);
          const resProduct = new Product(res.payload.id, res.payload.type, res.payload.manufactorer,
            res.payload.description, res.payload.price, res.payload.warrantyInMonths);
          const resFile = new DisplayFile(res.payload.base64Image.id, res.payload.base64Image.name,
            res.payload.base64Image.type, res.payload.base64Image.imageBytes);
          this.products.push(new DisplayProduct(resProduct, resFile));
        } else {
          this.alertService.error(res.message);
        }
      });
    }
    this.closeModal(true);
  }

  generateEditModal(productId: number) {
    const displayProduct = this.products.find(x => x.product.id === productId);
    if (displayProduct !== null) {
      this.editing = true;
      this.productForm.patchValue({
        id: displayProduct.product.id,
        type: displayProduct.product.type,
        manufactorer: displayProduct.product.manufactorer,
        description: displayProduct.product.description,
        price: displayProduct.product.price,
        warrantyInMonths: displayProduct.product.warrantyInMonths
      });
      this.smartModalService.getModal('productModal').open();
    } else {
      this.alertService.error('Selection error, please try again');
    }
  }

  editImage() {
    if (this.editingImage === false) {
      this.editingImage = true;
    } else {
      this.editingImage = false;
    }
  }

  closeModal(closed: boolean) {
    if (closed == null) {
      this.smartModalService.getModal('productModal').close();
    }
    setTimeout(() => {
      this.submitted = false;
      this.editing = false;
      this.editingImage = false;
      this.isFileAttached = false;
      if (this.myInputVariable != null) {
        this.myInputVariable.nativeElement.value = '';
      }
      this.buildForm();
    }, 500);
  }

  deleteProduct(id: number) {
    this.crudService.deleteProduct(id).subscribe((res: any) => {
      if (res.success) {
        const displayProduct = this.products.find(x => x.product.id === res.payload);
        let removed = false;
        if (displayProduct != null) {
          const index: number = this.products.indexOf(displayProduct);
          if (index !== -1) {
            this.products.splice(index, 1);
            removed = true;
            this.alertService.success(res.message);
          }
        }
        if (!removed) {
          this.alertService.error('Error while fetching deleted product, please reload the page');
        }
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
