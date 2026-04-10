import {Component, OnInit} from '@angular/core';
import {LoginComponent} from 'src/app/shared/components/dialogs/login/login.component';
import {environment} from 'src/environments/environment';
import {Router} from '@angular/router';

@Component({
  selector: 'app-logout',
  template: ``,
  styles: [``],
  standalone: false
})
export class LogoutComponent implements OnInit {
  constructor(
    private loginComponent: LoginComponent,
    private router: Router,
  ) {
  }

  ngOnInit() {
    window.sessionStorage.removeItem('token');
    if (environment.MOCK_API) {
      this.router.navigate(['/home']);
      return;
    }
    this.loginComponent.showLoginModal();
  }
}
