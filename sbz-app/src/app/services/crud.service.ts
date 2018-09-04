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

  addProduct(product: Product) {
    const payload = new FormData();
    payload.append('name', product.name);
    payload.append('manufactorer', product.manufactorer);
    payload.append('description', product.description);
    payload.append('price', product.price.toString());
    payload.append('warrantyInMonths', product.warrantyInMonths.toString());
    payload.append('image', product.image);

    const params = new HttpParams();
    return this.httpClient.post('/api/rest/secured/admin/addProduct', payload, {params, headers : this.setHeaders(null)});
  }
}
