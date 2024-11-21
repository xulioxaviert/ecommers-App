import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ENDPOINTS } from '../core/const/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _authenticated = false;

  isAuthenticated$ = new BehaviorSubject<boolean>(false);
  // user$: BehaviorSubject<Users> = new BehaviorSubject<Users>({} as Users);



  constructor(private _httpClient: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<string> {

    const url = ENDPOINTS.login; //
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    });

    const payload = {
      username: username,
      password: password
    };

    return this._httpClient.post<string>(url, payload, { headers });
  }

  httpPostData(url: string, payload: any, headers?: HttpHeaders): Observable<any> {
    return this._httpClient.post<any>(url, payload, { headers });
  }

  setSessionStorage(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }
  setLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getSessionStorage(key: string) {
    return JSON.parse(sessionStorage.getItem(key) || '{}');
  }

  logout(): void {
    sessionStorage.clear();
    this.isAuthenticated$.next(false);
  }

  isAuthenticated() {
    const token = sessionStorage.getItem('token');
    if (token) {
      this.isAuthenticated$.next(true);
      this._authenticated = true;
    }
    return this._authenticated;
  }

}
