import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { Preference } from '../../models/preference';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { CartDisplayProduct } from '../../models/cart-display-product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-web-shop',
  templateUrl: './web-shop.component.html',
  styleUrls: ['./web-shop.component.css']
})
export class WebShopComponent implements OnInit {

  private submitted: boolean;
  private singleProductForm: FormGroup;
  @Input()selectedTabIndex: number;
  private searchData = [];
  private selectedPType = {};
  private foundProducts = [];
  private hasFoundProducts: boolean;
  private cart = [];
  private cartPriceSum: number;
  private networkSystemForm: FormGroup;
  private networkSystemToggled: boolean;

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
    this.networkSystemToggled = false;
    this.selectedTabIndex = 0;
    this.cartPriceSum = 0.0;
    this.getParams();
  }

  changeShoppingMode() {
    if (this.networkSystemToggled === false) {
      this.networkSystemToggled = true;
    } else {
      this.networkSystemToggled = false;
    }
  }

  get spf () { return this.singleProductForm.controls; }

  getParams() {
    this.crudService.getProductParams().subscribe((res: any) => {
      if (res.success) {
        this.searchData = res.payload;
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  changeSelectedType(pType: string) {
    this.selectedPType = this.searchData.find(p => p.productType === pType);
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
          const resProduct = new Product(element.product.id, element.product.type, element.product.manufactorer,
            element.product.description, element.product.price, element.product.warrantyInMonths, element.product.lagerQuantity);
          const resFile = new DisplayFile(element.product.base64Image.id, element.product.base64Image.name,
            element.product.base64Image.type, element.product.base64Image.imageBytes);
          let preferences = null;
          if (element.preferences != null) {
            preferences = [];
            element.preferences.forEach(p => {
              const pref = new Preference(p.id, p.user.id, p.productType,
                p.preferenceType.name, p.value, p.productsCount, p.percentage);
              preferences.push(pref);
            });
          }
          this.foundProducts.push(new DisplayProduct(resProduct, resFile, preferences));
        });
        this.hasFoundProducts = true;
        this.selectedTabIndex = 1;
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  addToCart(item: DisplayProduct) {
    const query = this.cart.find(i => i.displayProduct.product.id === item.product.id);
    if (query != null) {
      this.alertService.warning('Item already in cart. Go to the carts tab to increase quantity');
    } else {
      const cartItem = new CartDisplayProduct(item, 1);
      this.cart.push(cartItem);
      this.calculateCartPrice();
      this.alertService.success('Succesfully added to cart');
    }
  }

  calculateCartPrice() {
    this.cartPriceSum = 0;
    this.cart.forEach(i => {
      this.cartPriceSum += i.displayProduct.product.price * i.quantity;
    });
  }

  updateQuantity(id: number, event) {
    const item = this.cart.find(i => i.displayProduct.product.id === id);
    item.quantity = event.value;
    this.calculateCartPrice();
  }

  removeFromCart(item: CartDisplayProduct) {
    const index: number = this.cart.indexOf(item);
    let removed = false;
    if (index !== -1) {
      this.cart.splice(index, 1);
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
    this.crudService.shop(this.cart).subscribe((res: any) => {
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
