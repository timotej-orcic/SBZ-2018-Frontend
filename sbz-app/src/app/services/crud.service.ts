import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Product } from '../models/product';

const multipartHeader = new HttpHeaders({ 'Accept': 'multipart/form-data'});

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
}
