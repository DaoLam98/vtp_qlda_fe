import {Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {ApiService} from '@c10t/nice-component-library';
import {environment} from 'src/environments/environment';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
  }

  login(loginPayload: any) {
    const headers = new HttpHeaders().set('Content-type', 'application/x-www-form-urlencoded');
    return this.apiService.post('/oauth/token', loginPayload, {headers}, environment.BASE_AUTHORIZATION_URL);
  }

  loginWithKeyCloak(loginPayload: any) {
    const headers = new HttpHeaders().set('Content-type', 'application/x-www-form-urlencoded');
    return this.apiService.post('/auth/login', loginPayload, {headers});
  }

  isAuthenticated() {
    if (environment.MOCK_API) {
      return true;
    }
    if(window.sessionStorage.getItem('token') != null) {
      return true;
    }
    return false;
  }

  checkAuthentication(): void {
    if (environment.MOCK_API) {
      // Dev-only: bypass login flow, ensure token exists so interceptors/resolvers behave normally.
      if (!window.sessionStorage.getItem('token')) {
        window.sessionStorage.setItem('token', JSON.stringify({
          token_type: 'Bearer',
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        }));
      }

      // If user hits /logout while mocking, just go home.
      const currentUrl = window.location.pathname;
      const hash = window.location.hash || '';
      if (currentUrl.includes('/logout') || hash.includes('/logout')) {
        this.router.navigate(['/home']);
      }
      return;
    }

    const token = window.sessionStorage.getItem('token');
    const currentUrl = window.location.pathname;
    const hash = window.location.hash || '';

    if(token) {
      return;
    }

    if(currentUrl.includes('/auth/callback') || hash.includes('/auth/callback')) {
      const [, queryString] = hash.split('?');

      const params: { [key: string]: string } = {};
      if(queryString) {
        const queryParts = new URLSearchParams(queryString);
        queryParts.forEach((value, key) => {
          params[key] = value;
        });
      }
      this.router.navigate(['/auth/callback'], {queryParams: params});
      return;
    }

    // Không có token và không phải route callback -> chuyển đến logout
    this.router.navigate(['/logout']);
  }
}
