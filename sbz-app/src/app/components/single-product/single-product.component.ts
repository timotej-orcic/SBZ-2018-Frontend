import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { CartDisplayProduct } from '../../models/cart-display-product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.css']
})
export class SingleProductComponent implements OnInit {

  private submitted: boolean;
  private singleProductForm: FormGroup;
  @Input()selectedTabIndex: number;
  private productTypes = [];
  private manufactorers = [];
  private foundProducts = [];
  private hasFoundProducts: boolean;
  private singleProductsCart = [];
  private singlePrCartPriceSum: number;

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
    this.selectedTabIndex = 0;
    this.singlePrCartPriceSum = 0.0;
    this.getParams();
  }

  get spf () { return this.singleProductForm.controls; }

  getParams() {
    this.crudService.getProductParams().subscribe((res: any) => {
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

    this.foundProducts = [];

    this.crudService.findSingleProduct(product).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        res.payload.forEach(element => {
          const resProduct = new Product(element.id, element.type, element.manufactorer,
            element.description, element.price, element.warrantyInMonths, element.lagerQuantity);
          const resFile = new DisplayFile(element.base64Image.id, element.base64Image.name,
            element.base64Image.type, element.base64Image.imageBytes);
          this.foundProducts.push(new DisplayProduct(resProduct, resFile));
        });
        this.hasFoundProducts = true;
        this.selectedTabIndex = 1;
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  addToCart(item: DisplayProduct) {
    const query = this.singleProductsCart.find(i => i.displayProduct.product.id === item.product.id);
    if (query != null) {
      this.alertService.warning('Item already in cart. Go to the carts tab to increase quantity');
    } else {
      const cartItem = new CartDisplayProduct(item, 1);
      this.singleProductsCart.push(cartItem);
      this.calculateCartPrice();
      this.alertService.success('Succesfully added to cart');
    }
  }

  calculateCartPrice() {
    this.singlePrCartPriceSum = 0;
    this.singleProductsCart.forEach(i => {
      this.singlePrCartPriceSum += i.displayProduct.product.price * i.quantity;
    });
  }

  updateQuantity(id: number, event) {
    const item = this.singleProductsCart.find(i => i.displayProduct.product.id === id);
    item.quantity = event.value;
    this.calculateCartPrice();
  }

  removeFromCart(item: CartDisplayProduct) {
    const index: number = this.singleProductsCart.indexOf(item);
    let removed = false;
    if (index !== -1) {
      this.singleProductsCart.splice(index, 1);
      removed = true;
    }

    if (removed) {
      this.alertService.success('Removed from cart');
      this.calculateCartPrice();
    } else {
      this.alertService.error('Please try again');
    }
  }

  checkout() {
    this.crudService.shop(this.singleProductsCart).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success('Shopping successfull');
        setTimeout(() => {
          this.router.navigate(['web-shop']);
        }, 1000);
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
