import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {environment} from 'src/environments/environment';
import {AuthoritiesService} from '@c10t/nice-component-library';
import {MatDialog} from '@angular/material/dialog';
import {AppComponent} from 'src/app/app.component';
import {
  PersonalInformationComponent
} from 'src/app/shared/components/dialogs/personal-information/personal-information.component';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
  standalone: false,
})
export class TopNavComponent {
  selectedLanguage: string;
  currentTheme: string;
  languageKey: string = 'lang' + environment.CLIENT_ID;
  @ViewChild('userName') userName!: ElementRef;

  get environment() {
    return environment;
  }

  get username() {
    return !!this.authoritiesService.me ? this.authoritiesService.me.name : '';
  }

  constructor(
    protected cookieService: CookieService,
    protected layoutComponent: AppComponent,
    protected router: Router,
    protected authoritiesService: AuthoritiesService,
    protected matDialog: MatDialog,
  ) {
    this.selectedLanguage = '' + window.sessionStorage.getItem(this.languageKey);

    if(this.cookieService.get('theme') === 'undefined' || this.cookieService.get('theme') === '') {
      this.currentTheme = environment.DEFAULT_THEME;
    } else {
      this.currentTheme = this.cookieService.get('theme');
    }

    layoutComponent.changeTheme(this.currentTheme);
    this.cookieService.set('theme', this.currentTheme);
  }

  showUserMenu() {
    const username = this.userName.nativeElement;
    if(username.classList.contains('off')) {
      username.classList.remove('off');
    } else {
      username.classList.add('off');
    }
  }

  openDialogInformation() {
    this.matDialog.open(PersonalInformationComponent, {
      width: '80%',
      maxWidth: '90vw',
    });
  }

  logout(): void {
    this.router.navigate(['logout']).then();
  }
}
