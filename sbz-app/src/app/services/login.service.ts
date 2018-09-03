import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private httpClient: HttpClient) { }

  login(user) {
    return this.httpClient.post('api/rest/login', user);
  }

  logout(username) {
    let params = new HttpParams();
    params = params.append('username', username);

    return this.httpClient.get('api/rest/secured/logout', {params: params, headers: this.setHeaders()})
  }

  setHeaders() {
    let headers = new HttpHeaders();
    headers = headers.set('token', localStorage.getItem('userToken'));

    return headers;
  }
}
