import {Component, Injectable, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '@c10t/nice-component-library';
import {AuthenticationService} from 'src/app/core';

@Component({
  template: ``,
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
@Injectable({providedIn: 'root'})
export class CallbackSSOComponent {
  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService
  ) {
  }
}
