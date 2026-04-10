import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-forbidden',
  standalone: true,
  templateUrl: './forbidden.component.html'
})
export class ForbiddenComponent {

  constructor(private router: Router) {
  }

  goHome() :void{
    this.router.navigate(['home']).then();
  }

}
