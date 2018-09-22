import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Product } from '../../models/product';
import { FormGroup, FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatSlideToggle } from '@angular/material';
import { Discount } from '../../models/discount';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {

  private products = [];
  private discounts = [];
  private productForm: FormGroup;
  private submitted: boolean;
  private editing: boolean;
  private editingImage: boolean;
  private isFileAttached: boolean;
  private fileSelected: File;
  @ViewChild('imageInput') myInputVariable: ElementRef;
  @ViewChild('prodForm') prodForm: FormGroupDirective;
  @ViewChild(NavbarComponent) navbar;
  private discountsToggled: boolean;
  private automaticDiscounts: boolean;
  @ViewChild(MatSlideToggle) mySlideToggle: MatSlideToggle;
  private isNewDiscount: boolean;
  private discountForm: FormGroup;
  private dateNow: Date;
  private minDate: Date;
  private discSubmitted: boolean;
  @ViewChild('discForm') discForm: FormGroupDirective;

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
            res.payload.forEach(elem => {
              const resProduct = new Product(elem.id, elem.type, elem.manufactorer,
                elem.description, elem.specialLabel, elem.price, elem.warrantyInMonths, elem.lagerQuantity);
              const resFile = new DisplayFile(elem.base64Image.id, elem.base64Image.name,
                elem.base64Image.type, elem.base64Image.imageBytes);
              this.products.push(new DisplayProduct(resProduct, resFile));
            });
          }
        });
        this.crudService.getDiscouts().subscribe((res: any) => {
          if (res.success) {
            res.payload.forEach(disc => {
              const resDisc = new Discount(disc.id, disc.discountTypeId, disc.beginDate, disc.endDate,
                disc.discObjId, disc.discValue);
                this.discounts.push(resDisc);
            });
          }
        });
        this.buildProductsForm();
        this.editingImage = false;
        this.discountsToggled = false;
        this.automaticDiscounts = false;
        this.isNewDiscount = true;
        this.buildDiscountForm();
        this.minDate = new Date();
        this.dateNow = new Date();
      } else {
        this.alertService.error('You are not authorezed for this page');
        setTimeout(() => {
          this.router.navigate(['']);
        }, 1000);
      }
    } else {
      this.alertService.error('You are not signed in');
      setTimeout(() => {
        this.router.navigate(['']);
      }, 1000);
    }
  }

  setMode(event) {
    this.discountsToggled = event;
  }

  buildProductsForm() {
    this.productForm = this.formBuilder.group({
      id: [''],
      type: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      manufactorer: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(300)]],
      specialLabel: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^((0|([1-9]\d*)){1,10})(\.\d{1,4})?$/)]],
      warrantyInMonths: ['', [Validators.required]],
      lagerQuantity: ['', [Validators.required]]
    });
  }

  get f() { return this.productForm.controls; }

  buildDiscountForm() {
    this.discountForm = this.formBuilder.group({
      id: [''],
      discObjId: [''],
      beginDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      value: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  get dsf() { return this.discountForm.controls; }

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
              displayProduct.product.specialLabel = res.payload.specialLabel;
              displayProduct.product.price = res.payload.price;
              displayProduct.product.warrantyInMonths = res.payload.warrantyInMonths;
              displayProduct.image = new DisplayFile(res.payload.base64Image.id, res.payload.base64Image.name,
                res.payload.base64Image.type, res.payload.base64Image.imageBytes);
            } else {
              this.alertService.warning('Error while fetching updated product, please reload the page');
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
              res.payload.description, res.payload.specialLabel, res.payload.price, res.payload.warrantyInMonths,
                res.payload.lagerQuantity);
            const resFile = new DisplayFile(res.payload.base64Image.id, res.payload.base64Image.name,
              res.payload.base64Image.type, res.payload.base64Image.imageBytes);
            this.products.push(new DisplayProduct(resProduct, resFile));
          } else {
            this.alertService.error(res.message);
          }
        });
    }
    this.closeProductsModal(true);
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
        specialLabel: displayProduct.product.specialLabel,
        price: displayProduct.product.price,
        warrantyInMonths: displayProduct.product.warrantyInMonths,
        lagerQuantity: displayProduct.product.lagerQuantity
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

  closeProductsModal(closed: boolean) {
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
      this.fileSelected = null;
      this.prodForm.resetForm();
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
          this.alertService.warning('Error while fetching deleted product, please reload the page');
        }
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  changeDiscountsMode() {
    if (this.automaticDiscounts === false) {
      const dialogRes = confirm('Are you sure you want to ENABLE automatic discounts?');
      if (dialogRes === true) {
        this.automaticDiscounts = true;
        this.mySlideToggle.checked = true;
      } else {
        this.mySlideToggle.checked = false;
      }
    } else {
      const dialogRes = confirm('Are you sure you want to DISABLE automatic discounts?');
      if (dialogRes === true) {
        this.automaticDiscounts = false;
        this.mySlideToggle.checked = false;
      } else {
        this.mySlideToggle.checked = true;
      }
    }
  }

  generateDiscountModal(productId: number) {
    const disc = this.discounts.find(x => x.discObjId === productId);
    if (disc == null) {
      this.isNewDiscount = true;
      this.dsf.discObjId.setValue(productId);
    } else {
      this.isNewDiscount = false;
      this.discountForm.patchValue({
        id: disc.id,
        discObjId: disc.discObjId,
        beginDate: JSON.parse(JSON.stringify(disc.beginDate)).substring(0, 10),
        endDate: JSON.parse(JSON.stringify(disc.endDate)).substring(0, 10),
        value: disc.value
      });
    }
    this.smartModalService.getModal('discountModal').open();
  }

  setMinDate(event) {
    this.minDate = event.value;
  }

  closeDiscountsModal(closed: boolean) {
    if (closed == null) {
      this.smartModalService.getModal('discountModal').close();
    }
    setTimeout(() => {
      this.discSubmitted = false;
      this.isNewDiscount = true;
      this.discForm.resetForm();
    }, 500);
  }

  postDiscountForm(discountForm) {
    this.discSubmitted = true;

    if (this.discForm.invalid) {
      return;
    }

    this.smartModalService.close('discountModal');
    if (this.isNewDiscount) {
      this.crudService.addDiscount(discountForm).subscribe((res: any) => {
        if (res.success) {
          this.alertService.success(res.message);
          const resDisc = new Discount(res.payload.id, 0, res.payload.beginDate.formatDate(),
            res.payload.endDate.formatDate(), res.payload.discObjId, res.payload.discValue);
          this.discounts.push(resDisc);
        } else {
          this.alertService.error(res.message);
        }
      });
    } else {
      this.crudService.editDiscount(discountForm).subscribe((res: any) => {
        if (res.success) {
          this.alertService.success(res.message);
          const disc = this.discounts.find(d => d.id === res.payload.id);
          if (disc != null) {
            disc.endDate = res.payload.endDate;
            disc.value = res.payload.discValue;
          } else {
            this.alertService.warning('Error while fetching updated discount, please reload the page');
          }
        } else {
          this.alertService.error(res.message);
        }
      });
    }
    this.closeDiscountsModal(true);
  }

  deleteDiscount(id: number) {
    this.crudService.deleteDiscount(id).subscribe((res: any) => {
      if (res.success) {
        const disc = this.discounts.find(x => x.id === res.payload);
        let removed = false;
        if (disc != null) {
          const index: number = this.discounts.indexOf(disc);
          if (index !== -1) {
            this.discounts.splice(index, 1);
            removed = true;
            this.alertService.success(res.message);
          }
        }
        if (!removed) {
          this.alertService.warning('Error while fetching deleted discount, please reload the page');
        }
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
