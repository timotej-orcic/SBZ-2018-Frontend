import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { DisplayFile } from '../../models/display-file';
import { DisplayProduct } from '../../models/display-product';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-web-shop',
  templateUrl: './web-shop.component.html',
  styleUrls: ['./web-shop.component.css']
})
export class WebShopComponent implements OnInit {

  private showMe: boolean;
  private networkSystemForm: FormGroup;

  constructor(private crudService: CrudService, private alertService: AlertService,
    private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    if (window.location.href.toString().includes('/single-product')) {
      this.showMe = false;
    } else {
      this.showMe = true;
    }
  }

  singleProducts() {
    this.showMe = false;
    this.router.navigate(['web-shop/single-product']);
  }

  networkSystems() {
    /*this.crudService.setShoppingAgenda('networkSystem').subscribe((res: any) => {
      if (res.success) {
      } else {
        this.alertService.error(res.message);
      }
    });*/
  }
}
