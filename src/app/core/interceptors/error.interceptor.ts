import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {AuthenticationService} from '../services/authentication.service';
import {LoginComponent} from 'src/app/shared/components/dialogs/login/login.component';
import {environment} from 'src/environments/environment';
import {v4 as uuidv4} from 'uuid';
import {AuthoritiesService, UtilsService} from '@c10t/nice-component-library';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class ErrorInterceptor implements HttpInterceptor {
  // available (d.g. refresh pending).
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // Refresh Token Subject tracks the current token, or is null if no token is currently
  private refreshTokenInProgress = false;
  private isShowLoginModal = false;

  constructor(
    private authenticationService: AuthenticationService,
    protected authoritiesService: AuthoritiesService,
    private loginComponent: LoginComponent,
    protected toastr: ToastrService,
    private tranlService: TranslateService,
    private injector: Injector,
    private router: Router) {
  }

  getAccessToken() {
    if (this.authenticationService.isAuthenticated()) {
      const json = JSON.parse('' + window.sessionStorage.getItem('token'));
      return json.token_type + ' ' + json.access_token;
    } else {
      return 'Basic ' + btoa(environment.CLIENT_ID + ':' + environment.CLIENT_SECRET);
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const uniqueId = uuidv4();

    if (request.url.includes('voffice-gateway')) {
      return this.authoritiesService.me$.pipe(
        take(1),
        switchMap((res: any) => {
          request = request.clone({
            setHeaders: {
              'Accept-Language': window.sessionStorage.getItem('lang' + environment.CLIENT_ID) + '',
              'x-request-id': uniqueId,
              'X_AUTH_TOKEN': res?.userAuthentication?.principal?.voAuthentication || '',
              Authorization: this.getAccessToken(),
            },
          });

          return this.handleRequestWithCatch(request, next);
        }),
      );
    } else if (!environment.NON_AUTHOR_LIST.some((item) => request.method.concat(request.url, '/').includes(item))) {
      request = request.clone({
        setHeaders: {
          'Accept-Language': window.sessionStorage.getItem('lang' + environment.CLIENT_ID) + '',
          Authorization: this.getAccessToken(),
          'x-request-id': uniqueId,
        },
      });
    } else if (!request.url.startsWith(environment.BASE_AUTHORIZATION_URL_KEYCLOAK)) {
      request = request.clone({
        setHeaders: {
          'Accept-Language': window.sessionStorage.getItem('lang' + environment.CLIENT_ID) + '',
          'x-request-id': uniqueId,
        },
      });
    }

    return this.handleRequestWithCatch(request, next);
  }

  process401Error() {
    const tk = window.sessionStorage.getItem('token');
    if (tk) {
      this.refreshToken().subscribe(newToken => {
          if (newToken) {
            window.sessionStorage.setItem('token', JSON.stringify(newToken));
            this.tokenSubject.next('1');
          }
        }, error => {
          window.sessionStorage.removeItem('token');
          this.process401Error();
        },
      );
    } else {
      if (!this.isShowLoginModal) {
        this.isShowLoginModal = true;
        const dlgRef = this.loginComponent.showLoginModal();
        dlgRef.afterClosed().subscribe(result => {
          if (window.sessionStorage.getItem('token')) {
            this.refreshTokenInProgress = false;
            this.isShowLoginModal = false;
            this.tokenSubject.next('1');
          }
        });
      }
    }
  }

  refreshToken() {
    const http = this.injector.get(HttpClient);
    const refresh_token = JSON.parse('' + window.sessionStorage.getItem('token')).refresh_token;
    window.sessionStorage.removeItem('token');
    const headers = {
      'Content-type': 'application/x-www-form-urlencoded',
    };
    const body = new HttpParams()
      .set('type', 'GUEST')
      .set('refreshToken', refresh_token);
    return http.post(environment.BASE_URL + '/auth/refresh-token', body.toString(), {headers});
  }

  // Hàm tách riêng phần xử lý lỗi để tái sử dụng
  private handleRequestWithCatch(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          if (!this.refreshTokenInProgress) {
            this.refreshTokenInProgress = true;
            this.process401Error();
            return this.tokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap(token => {
                this.refreshTokenInProgress = false;
                this.isShowLoginModal = false;
                return next.handle(this.setAuthHeader(request));
              }),
            );
          }
        } else if (err.status === 403) {
          this.router.navigate(['/403']);
        } else if (err.status === 413) {
          return throwError("common.error.max-file-size-upload");
        }
        if (err.error instanceof Blob) {
          return throwError(err);
        }  
        
        const error = (err.error?.message && err.status !== 0) ? err.error?.message : (err.status + '');        
        return throwError(error);
      }),
    );
  }

  private setAuthHeader(request: HttpRequest<any>) {
    return request.clone({
      url: request.url,
      setHeaders: {Authorization: this.getAccessToken()}
    });
  }
}
