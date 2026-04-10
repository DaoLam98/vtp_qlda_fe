import {Injectable} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {NavigatorModel} from '@c10t/nice-component-library';

@Injectable({providedIn: 'root'})
export class NavService {
  public title: string | undefined | null;
  public currentUrl = new BehaviorSubject<string>('');
  public username: string | undefined | null;
  navItems: NavigatorModel[] | undefined | null;
  isExpanded$ = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if(event instanceof NavigationEnd) {
        this.currentUrl.next(event.urlAfterRedirects);
      }
    });
  }

  public closeNav() {
    this.isExpanded$.next(false);
  }

  public openNav() {
    this.isExpanded$.next(true);
  }
}
