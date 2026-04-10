import {Component, Injectable, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpParams} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {ApiService, AuthoritiesService, FormStateService} from '@c10t/nice-component-library';
import {AuthenticationService, NavService} from 'src/app/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
@Injectable({providedIn: 'root'})
export class LoginComponent implements OnInit {
  LoginType = {
    GUEST: 'GUEST',
    SSO: 'SSO'
  };

  type = this.LoginType.GUEST

  form: FormGroup = new FormGroup({
    userName: new FormControl('', Validators.required),
    pass: new FormControl('', Validators.required),
    remember: new FormControl(''),
  });
  error: string | null | undefined;

  constructor(
    protected dialog: MatDialog,
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected authenticationService: AuthenticationService,
    protected apiService: ApiService,
    protected cookieService: CookieService,
    protected location: Location,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected formStateService: FormStateService,
    protected navService: NavService,
  ) {
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.invalid) return;
    this.resetInfo();
    if(this.form.valid) {
      const body = new HttpParams()
        .set('userName', this.form.controls.userName.value.trim())
        .set('pass', this.form.controls.pass.value.trim())
        .set('type', this.type)

      this.authenticationService.loginWithKeyCloak(body.toString()).subscribe((data: any) => {

        window.sessionStorage.setItem('token', JSON.stringify(data));
        window.localStorage.setItem('token', JSON.stringify(data));
        window.localStorage.setItem('userType', "external-user");
        window.localStorage.setItem('userName', this.form.controls.userName.value.trim());
        this.cookieService.set('remember', this.form.controls.remember.value.toString());
        this.hideLoginModal();
        this.router.navigate(['/home']).then();

      }, error => {
        this.translateService.get('login.error').subscribe(e => {
          this.error = e;
        });
      });
    }
  }

  resetInfo() {
    this.authoritiesService.me = null;
    this.navService.navItems = null;
    this.formStateService.setMapState(new Map<string, FormGroup>());
  }

  ngOnInit() {
    window.sessionStorage.removeItem('token');
  }

  showLoginModal() {
    return this.dialog.open(LoginComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });
  }

  hideLoginModal() {
    this.dialog.closeAll();
  }
}
