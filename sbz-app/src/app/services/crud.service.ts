import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private httpClient: HttpClient) { }

  setHeaders(headers: HttpHeaders) {
    if (headers === null) {
      headers = new HttpHeaders();
    }

    headers = headers.set('token', localStorage.getItem('userToken'));
    return headers;
  }

  getProducts() {
    return this.httpClient.get('api/rest/secured/admin/getProducts', {headers : this.setHeaders(null)});
  }

  addProduct(product: Product, image: File) {
    const payload = new FormData();

    payload.append('product', new Blob([JSON.stringify(product)], {type: 'application/json'}));
    payload.append('image', image, image.name);

    const params = new HttpParams();
    return this.httpClient.post('/api/rest/secured/admin/addProduct', payload, {params, headers : this.setHeaders(null)});
  }

  editProduct(product: Product, image: File) {
    const payload = new FormData();

    payload.append('product', new Blob([JSON.stringify(product)], {type: 'application/json'}));
    if (image == null) {
      const content = 'Empty';
      const data = new Blob([content], { type: 'text/plain' });
      const arrayOfBlob = new Array<Blob>();
      arrayOfBlob.push(data);
      const emptyText = new File(arrayOfBlob, 'empty.txt', { type: 'text/plain' });
      payload.append('image', emptyText, '');
    } else {
      payload.append('image', image, image.name);
    }

    const params = new HttpParams();
    return this.httpClient.post('/api/rest/secured/admin/editProduct', payload, {params, headers : this.setHeaders(null)});
  }

  deleteProduct(id: number) {
    let params = new HttpParams();
    params = params.append('id', id.toString());

    return this.httpClient.get('api/rest/secured/admin/deleteProduct', {params: params, headers: this.setHeaders(null)});
  }

  getProductParams() {
    return this.httpClient.get('api/rest/secured/web-shop/getProductParams', {headers: this.setHeaders(null)});
  }

  findSingleProduct(product) {
    return this.httpClient.post('/api/rest/secured/web-shop/findSingleProduct', product, {headers : this.setHeaders(null)});
  }

  shop(shoppingCart) {
    const payload = [];
    shoppingCart.forEach(element => {
      const item = {
        productId: 0,
        quantity: 0,
        price: 0
      };
      item.productId = element.displayProduct.product.id;
      item.quantity = element.quantity;
      item.price = element.displayProduct.product.price * element.quantity;
      payload.push(item);
    });
    return this.httpClient.post('/api/rest/secured/web-shop/shop', payload, {headers : this.setHeaders(null)});
  }

  findNetworkSystem(networkSystem) {
    return this.httpClient.post('/api/rest/secured/web-shop/findNetworkSystem', networkSystem, {headers : this.setHeaders(null)});
  }

  getDiscouts() {
    return this.httpClient.get('api/rest/secured/admin/getDiscounts', {headers : this.setHeaders(null)});
  }

  addDiscount(discount) {
    return this.httpClient.post('/api/rest/secured/admin/addDiscount', discount, {headers : this.setHeaders(null)});
  }

  editDiscount(discount) {
    return this.httpClient.post('/api/rest/secured/admin/editDiscount', discount, {headers : this.setHeaders(null)});
  }

  deleteDiscount(id: number) {
    let params = new HttpParams();
    params = params.append('id', id.toString());

    return this.httpClient.get('api/rest/secured/admin/deleteDiscount', {params: params, headers: this.setHeaders(null)});
  }
}
