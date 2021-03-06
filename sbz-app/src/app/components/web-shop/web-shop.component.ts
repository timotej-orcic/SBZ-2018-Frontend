import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { Preference } from '../../models/preference';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { CartDisplayProduct } from '../../models/cart-display-product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource, MatSelect } from '@angular/material';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-web-shop',
  templateUrl: './web-shop.component.html',
  styleUrls: ['./web-shop.component.css']
})
export class WebShopComponent implements OnInit {

  private submitted: boolean;
  private singleProductForm: FormGroup;
  @Input() selectedTabIndex: number;
  private searchData = [];
  private selectedPType = {};
  private foundProducts = [];
  private foundPreferences = [];
  private hasFoundProducts: boolean;
  private cart = [];
  private cartPriceSum: number;
  private networkSystemForm: FormGroup;
  private networkSystemToggled: boolean;
  private manufactorerFilter: boolean;
  private priceFilter: boolean;
  private warrantyFilter: boolean;
  private preferenceFilter: boolean;
  private filtersList = ['Manufactorer', 'Price', 'Warranty', 'My preferences'];
  private streetCablingList = ['Copper', 'Optical-SM', 'Optical-MM'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource: any;
  private isCopper: boolean;
  private isOpticalSM: boolean;
  private isOpticalMM: boolean;
  private maxFloors: number;
  private maxFloorSurface: number;
  private minFloorSurface: number;
  private maxFloorOffices: number;
  private maxOfficeComputers: number;
  private maxDownloadSpeed: number;
  @ViewChild('filters') filters: MatSelect;

  constructor(private crudService: CrudService, private alertService: AlertService,
    private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    const userToken = localStorage.getItem('userToken');
    if (userToken !== null) {
      const loggedUser = JSON.parse(window.atob(userToken.split('.')[1]));
      const userRole = loggedUser.role[0].authority;
      if (userRole === '0') {
        this.buildSingleProductsForm();
        this.buildNetworkSystemForm();
        this.networkSystemToggled = false;
        this.manufactorerFilter = false;
        this.priceFilter = false;
        this.warrantyFilter = false;
        this.preferenceFilter = false;
        this.selectedTabIndex = 0;
        this.cartPriceSum = 0.0;
        this.isCopper = false;
        this.isOpticalSM = false;
        this.isOpticalMM = false;
        this.maxFloors = 0;
        this.maxFloorSurface = 0;
        this.minFloorSurface = 0;
        this.maxFloorOffices = 0;
        this.maxOfficeComputers = 0;
        this.maxDownloadSpeed = 0;
        this.getParams();
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

  buildSingleProductsForm() {
    this.singleProductForm = this.formBuilder.group({
      productType: ['', [Validators.required]],
      manufactorer: [''],
      priceMin: [''],
      priceMax: [''],
      warrantyInMonthsMin: [''],
      includeUserPreferences: ['']
    });
  }

  get spf() { return this.singleProductForm.controls; }

  buildNetworkSystemForm() {
    this.networkSystemForm = this.formBuilder.group({
      streetCabling: ['', [Validators.required]],
      floorsCount: ['', [Validators.required, Validators.min(1)]],
      avarageFloorSurface: ['', [Validators.required, Validators.min(5)]],
      avarageOfficeCountByFloor: ['', [Validators.required, Validators.min(1)]],
      avarageComputerCountByOffice: ['', [Validators.required, Validators.min(1)]],
      includeWiFi: [''],
      avarageWiFiCoverageSurfaceByFloor: [''],
      wantedAvarageDownloadSpeed: ['', [Validators.required, Validators.min(1)]],
      wantedAvarageUploadSpeed: ['', [Validators.required, Validators.min(1)]],
      calculateWithPreferences: [''],
      budget: ['', [Validators.required, Validators.min(0)]]
    });
  }

  get nsf() { return this.networkSystemForm.controls; }

  resetData() {
    if (this.dataSource != null) {
      this.disconnectPaginator();
    } else {
      this.dataSource = null;
    }
    this.foundProducts = [];
    this.foundPreferences = [];
    this.connectPaginator();
    this.buildSingleProductsForm();
    this.buildNetworkSystemForm();
  }

  resetSearchFilters(ns: boolean) {
    if (ns === true) {
      this.filtersList = ['Manufactorer', 'Price', 'Warranty'];
    } else {
      this.filtersList = ['Manufactorer', 'Price', 'Warranty', 'My preferences'];
    }
    this.manufactorerFilter = false;
    this.priceFilter = false;
    this.warrantyFilter = false;
    this.preferenceFilter = false;
    this.filters.options.find(o => o.value === null).select();
  }

  changeShoppingMode() {
    if (this.networkSystemToggled === false) {
      this.networkSystemToggled = true;
      this.resetSearchFilters(true);
      this.resetData();
    } else {
      this.networkSystemToggled = false;
      this.resetSearchFilters(false);
      this.resetData();
    }
  }

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

    if (this.dataSource != null) {
      this.disconnectPaginator();
    }
    this.foundProducts = [];
    this.foundPreferences = [];

    this.crudService.findSingleProduct(product).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        res.payload.products.forEach(element => {
          const resProduct = new Product(element.id, element.type, element.manufactorer,
            element.description, element.specialLabel, element.price, element.warrantyInMonths, element.lagerQuantity);
          const resFile = new DisplayFile(element.base64Image.id, element.base64Image.name,
            element.base64Image.type, element.base64Image.imageBytes);
          this.foundProducts.push(new DisplayProduct(resProduct, resFile));
        });
        if (res.payload.preferences != null) {
          res.payload.preferences.forEach(element => {
            const resPreference = new Preference(element.id, element.userId, element.productType,
              element.preferenceType, element.value, element.productsCount, element.percentage);
            this.foundPreferences.push(resPreference);
          });
        }
        this.hasFoundProducts = true;
        this.selectedTabIndex = 1;
        this.connectPaginator();
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  connectPaginator() {
    this.dataSource = new MatTableDataSource<Element>(this.foundProducts);
    this.obs = this.dataSource.connect();
    this.dataSource.paginator = this.paginator;
  }

  disconnectPaginator() {
    this.dataSource.disconnect();
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
        this.selectedTabIndex = 1;
        this.cart = [];
        this.calculateCartPrice();
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  changeSelectedFilter(filter: string) {
    if (filter === 'Manufactorer') {
      this.manufactorerFilter = true;
      this.priceFilter = false;
      this.warrantyFilter = false;
      this.preferenceFilter = false;
    } else if (filter === 'Price') {
      this.manufactorerFilter = false;
      this.priceFilter = true;
      this.warrantyFilter = false;
      this.preferenceFilter = false;
    } else if (filter === 'Warranty') {
      this.manufactorerFilter = false;
      this.priceFilter = false;
      this.warrantyFilter = true;
      this.preferenceFilter = false;
    } else if (filter === 'My preferences') {
      this.manufactorerFilter = false;
      this.priceFilter = false;
      this.warrantyFilter = false;
      this.preferenceFilter = true;
    } else {
      this.manufactorerFilter = false;
      this.priceFilter = false;
      this.warrantyFilter = false;
      this.preferenceFilter = false;
    }
  }

  sortItems(btnValue: string) {
    this.disconnectPaginator();
    if (this.manufactorerFilter === true) {
      if (btnValue === '1') {
        this.sortManufactorer(false, this.networkSystemToggled);
      } else {
        this.sortManufactorer(true, this.networkSystemToggled);
      }
    } else if (this.priceFilter === true) {
      if (btnValue === '1') {
        this.sortPrice(false, this.networkSystemToggled);
      } else {
        this.sortPrice(true, this.networkSystemToggled);
      }
    } else if (this.warrantyFilter === true) {
      if (btnValue === '1') {
        this.sortWarranty(false, this.networkSystemToggled);
      } else {
        this.sortWarranty(true, this.networkSystemToggled);
      }
    } else if (this.preferenceFilter === true) {
      if (btnValue === '1') {
        this.sortPreferenceManufactorer();
      } else if (btnValue === '2') {
        this.sortPreferencePrice();
      } else {
        this.sortPreferenceWarranty();
      }
    }
    this.connectPaginator();
  }

  sortManufactorer(invert: boolean, ns: boolean) {
    this.foundProducts = this.foundProducts.sort((obj1, obj2) => {
      if (ns === true) {
        if (obj1.displayProduct.product.manufactorer > obj2.displayProduct.product.manufactorer) {
          return 1;
        }
        if (obj1.displayProduct.product.manufactorer < obj2.displayProduct.product.manufactorer) {
          return -1;
        }
        return 0;
      } else {
        if (obj1.product.manufactorer > obj2.product.manufactorer) {
          return 1;
        }
        if (obj1.product.manufactorer < obj2.product.manufactorer) {
          return -1;
        }
        return 0;
      }
    });

    if (invert === true) {
      this.foundProducts.reverse();
    }
  }

  sortPrice(invert: boolean, ns: boolean) {
    this.foundProducts = this.foundProducts.sort((obj1, obj2) => {
      if (ns === true) {
        if (obj1.displayProduct.product.price > obj2.displayProduct.product.price) {
          return 1;
        }
        if (obj1.displayProduct.product.price < obj2.displayProduct.product.price) {
          return -1;
        }
        return 0;
      } else {
        if (obj1.product.price > obj2.product.price) {
          return 1;
        }
        if (obj1.product.price < obj2.product.price) {
          return -1;
        }
        return 0;
      }
    });

    if (invert === true) {
      this.foundProducts.reverse();
    }
  }

  sortWarranty(invert: boolean, ns: boolean) {
    this.foundProducts = this.foundProducts.sort((obj1, obj2) => {
      if (ns === true) {
        if (obj1.displayProduct.product.warrantyInMonths > obj2.displayProduct.product.warrantyInMonths) {
          return 1;
        }
        if (obj1.displayProduct.product.warrantyInMonths < obj2.displayProduct.product.warrantyInMonths) {
          return -1;
        }
        return 0;
      } else {
        if (obj1.product.warrantyInMonths > obj2.product.warrantyInMonths) {
          return 1;
        }
        if (obj1.product.warrantyInMonths < obj2.product.warrantyInMonths) {
          return -1;
        }
        return 0;
      }
    });

    if (invert === true) {
      this.foundProducts.reverse();
    }
  }

  sortPreferences(preferences: Preference[]) {
    preferences.sort((obj1, obj2) => {
      if (obj1.percentage > obj2.percentage) {
        return -1;
      }
      if (obj1.percentage < obj2.percentage) {
        return 1;
      }
      return 0;
    });

    return preferences;
  }

  sortPreferenceManufactorer() {
    let preferences = this.foundPreferences.filter(p => p.preferenceType === 'manufactorer');
    if (preferences.length === 0) {
      this.alertService.warning('No manufactorer preferences loaded');
      return;
    } else {
      preferences = this.sortPreferences(preferences);
      const tempProds = [];
      preferences.forEach(pref => {
        this.foundProducts.forEach(prod => {
          if (prod.product.manufactorer === pref.value) {
            tempProds.push(prod);
          }
        });
      });
      this.foundProducts.forEach(prod => {
        if (!tempProds.includes(prod)) {
          tempProds.push(prod);
        }
      });
      this.foundProducts = tempProds;
    }
  }

  sortPreferencePrice() {
    let preferences = this.foundPreferences.filter(p => p.preferenceType === 'price');
    if (preferences.length === 0) {
      this.alertService.warning('No price preferences loaded');
      return;
    } else {
      preferences = this.sortPreferences(preferences);
      const tempProds = [];
      preferences.forEach(pref => {
        this.foundProducts.forEach(prod => {
          if (pref.value.includes('+')) {
            const limit = pref.value.split('+')[0];
            if (prod.product.price >= limit) {
              tempProds.push(prod);
            }
          } else {
            const splits = pref.value.split('-');
            const minLimit = splits[0];
            const maxLimit = splits[1];
            if (prod.product.price >= minLimit && prod.product.price < maxLimit) {
              tempProds.push(prod);
            }
          }
        });
      });
      this.foundProducts.forEach(prod => {
        if (!tempProds.includes(prod)) {
          tempProds.push(prod);
        }
      });
      this.foundProducts = tempProds;
    }
  }

  sortPreferenceWarranty() {
    let preferences = this.foundPreferences.filter(p => p.preferenceType === 'warranty');
    if (preferences.length === 0) {
      this.alertService.warning('No warranty preferences loaded');
      return;
    } else {
      preferences = this.sortPreferences(preferences);
      const tempProds = [];
      preferences.forEach(pref => {
        this.foundProducts.forEach(prod => {
          if (pref.value.includes('+')) {
            const limit = pref.value.split('+')[0];
            if (prod.product.warrantyInMonths >= limit) {
              tempProds.push(prod);
            }
          } else {
            const splits = pref.value.split('-');
            const minLimit = splits[0];
            const maxLimit = splits[1];
            if (prod.product.warrantyInMonths >= minLimit && prod.product.warrantyInMonths < maxLimit) {
              tempProds.push(prod);
            }
          }
        });
      });
      this.foundProducts.forEach(prod => {
        if (!tempProds.includes(prod)) {
          tempProds.push(prod);
        }
      });
      this.foundProducts = tempProds;
    }
  }

  changeStreetCabling(cabling: string) {
    if (cabling === 'Copper') {
      this.isCopper = true;
      this.isOpticalSM = false;
      this.isOpticalMM = false;
      this.maxFloors = 2;
      this.maxFloorSurface = 150;
      this.minFloorSurface = 20;
      this.maxFloorOffices = 3;
      this.maxOfficeComputers = 5;
      this.maxDownloadSpeed = 100;
    } else if (cabling === 'Optical-SM') {
      this.isCopper = false;
      this.isOpticalSM = true;
      this.isOpticalMM = false;
      this.maxFloors = 10;
      this.maxFloorSurface = 500;
      this.minFloorSurface = 50;
      this.maxFloorOffices = 15;
      this.maxOfficeComputers = 10;
      this.maxDownloadSpeed = 1000;
    } else {
      this.isCopper = false;
      this.isOpticalSM = false;
      this.isOpticalMM = true;
      this.maxFloors = 100;
      this.minFloorSurface = 200;
      this.maxFloorSurface = 2000;
      this.maxFloorOffices = 100;
      this.maxOfficeComputers = 20;
      this.maxDownloadSpeed = 10000;
    }
    this.nsf.floorsCount.setValue(1);
    this.nsf.avarageFloorSurface.setValue(20);
    this.nsf.avarageOfficeCountByFloor.setValue(1);
    this.nsf.avarageComputerCountByOffice.setValue(1);
    this.nsf.avarageWiFiCoverageSurfaceByFloor.setValue(this.minFloorSurface);
    this.nsf.wantedAvarageDownloadSpeed.setValue(this.maxDownloadSpeed / 4);
    this.nsf.wantedAvarageUploadSpeed.setValue(this.maxDownloadSpeed / 8);
  }

  findNetworkSystem(networkSystem) {
    this.submitted = true;

    if (this.networkSystemForm.invalid) {
      return;
    }

    if (this.dataSource != null) {
      this.disconnectPaginator();
    }
    this.foundProducts = [];

    this.crudService.findNetworkSystem(networkSystem).subscribe((res: any) => {
      if (res.success) {
        this.alertService.success(res.message);
        res.payload.forEach(element => {
          const resProduct = new Product(element.product.id, element.product.type, element.product.manufactorer,
            element.product.description, element.product.specialLabel, element.product.price, element.product.warrantyInMonths,
            element.product.lagerQuantity);
          const resFile = new DisplayFile(element.product.base64Image.id, element.product.base64Image.name,
            element.product.base64Image.type, element.product.base64Image.imageBytes);
          const resDispProd = new DisplayProduct(resProduct, resFile);
          this.foundProducts.push(new CartDisplayProduct(resDispProd, element.quantity));
        });
        this.hasFoundProducts = true;
        this.selectedTabIndex = 1;
        this.connectPaginator();
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  addAllNSItemsToCart() {
    this.foundProducts.forEach(p => {
      if (!this.cart.includes(p)) {
        this.cart.push(p);
      }
    });
    this.calculateCartPrice();
    this.alertService.success('Succesfully added to cart');
    this.selectedTabIndex = 2;
  }
}
