import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-web-shop',
  templateUrl: './web-shop.component.html',
  styleUrls: ['./web-shop.component.css']
})
export class WebShopComponent implements OnInit {

  private submitted: boolean;
  private agendaSelected: boolean;
  private singleProduct: boolean;
  private singleProductForm: FormGroup;
  private networkSystemForm: FormGroup;
  private productTypes = [];
  private manufactorers = [];
  private foundProducts = [];

  constructor(private crudService: CrudService, private alertService: AlertService,
    private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.singleProductForm = this.formBuilder.group({
      productType: ['', [Validators.required]],
      manufactorer: ['', [Validators.required]],
      priceMin: [''],
      priceMax: [''],
      warrantyInMonthsMin: [''],
      warrantyInMonthsMax: [''],
      includeUserPreferences: ['']
    });
  }

  get spf () { return this.singleProductForm.controls; }

  singleProducts() {
    this.crudService.setShoppingAgenda('singleProduct').subscribe((res: any) => {
      if (res.success) {
        this.productTypes = res.payload[0];
        this.manufactorers = res.payload[1];
        this.agendaSelected = true;
        this.singleProduct = true;
      } else {
        this.alertService.error(res.message);
      }
    });
  }

  networkSystems() {
    this.crudService.setShoppingAgenda('networkSystem').subscribe((res: any) => {
      if (res.success) {
        this.agendaSelected = true;
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
        this.foundProducts = res.payload;
      } else {
        this.alertService.error(res.message);
      }
    });
  }
}
