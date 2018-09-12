import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.css']
})
export class SingleProductComponent implements OnInit {

  private submitted: boolean;
  private singleProductForm: FormGroup;
  private productTypes = [];
  private manufactorers = [];
  private foundProducts = [];
  private hasFoundProducts: boolean;
  private singleProductsCart = [];

  constructor(private crudService: CrudService, private alertService: AlertService,
    private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.singleProductForm = this.formBuilder.group({
      productType: ['', [Validators.required]],
      manufactorer: [''],
      priceMin: [''],
      priceMax: [''],
      warrantyInMonthsMin: [''],
      includeUserPreferences: ['']
    });
    this.setAgenda();
  }

  get spf () { return this.singleProductForm.controls; }

  setAgenda() {
    this.crudService.setShoppingAgenda('singleProduct').subscribe((res: any) => {
      if (res.success) {
        this.productTypes = res.payload[0];
        this.manufactorers = res.payload[1];
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  findSingleProduct(product) {
    this.submitted = true;

    if (this.singleProductForm.invalid) {
      return;
    }

    this.crudService.findSingleProduct(product).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        res.payload.forEach(element => {
          const resProduct = new Product(element.id, element.type, element.manufactorer,
            element.description, element.price, element.warrantyInMonths);
          const resFile = new DisplayFile(element.base64Image.id, element.base64Image.name,
            element.base64Image.type, element.base64Image.imageBytes);
          this.foundProducts.push(new DisplayProduct(resProduct, resFile));
        });
        this.hasFoundProducts = true;
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  addProductToCart(id: number) {
    this.singleProductsCart.push(id);
  }
}
