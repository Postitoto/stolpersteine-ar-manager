import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { UserToken } from 'src/app/models/userToken';
import { AppConfig } from 'src/app/util-config/app-config';
import { Logger } from 'src/app/util-config/logger';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }
 
  getUserCredentials() {
    const token = localStorage.getItem('userStolpersteinAccessToken');
    let userAuthentication;
    if (token) {
        userAuthentication = 'Token ' + token;
    }
    return userAuthentication;
  }

  getUserName() {
    const username = localStorage.getItem('stolpersteinUserName')
    return username ? username : "";
  }

  setUserCredentials(credentials: string, username: string) {
    localStorage.setItem('userStolpersteinAccessToken', credentials);
    localStorage.setItem('stolpersteinUserName', username);
  }

  logoutUser() {
    if (localStorage.getItem('userStolpersteinAccessToken')) {
      localStorage.removeItem('userStolpersteinAccessToken');
    }
    if (localStorage.getItem('stolpersteinUserName')) {
      localStorage.removeItem('stolpersteinUserName')
    }
  }

  fetchUserToken(name: string, pw: string) {
    const requestBody = {
      username: name,
      password: pw
    };
    return this.http.post(`${AppConfig.getBackendUrl()}/api/get-auth-token`, requestBody).toPromise() as Promise<UserToken>;
  }

  loginStatus() {
    if (localStorage.getItem('userStolpersteinAccessToken')) {
      return true;
    }
    return false;
  }
  
}
