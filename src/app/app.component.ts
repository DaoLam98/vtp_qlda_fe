import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NavigationEnd, Router} from '@angular/router';
import {ApiService, AuthoritiesService, MenuModel, NavigatorModel} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {OverlayContainer} from 'ngx-toastr';
import {filter, Subscription} from 'rxjs';
import {AuthenticationService, NavService} from 'src/app/core';
import {ChangePasswordComponent} from 'src/app/shared/components/dialogs/change-password/change-password.component';
import {TopNavComponent} from './layouts/top-nav/top-nav.component';
import {environment} from 'src/environments/environment';
import { PermissionCheckingUtil } from './shared/utils/permission-checking.util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(TopNavComponent) topNav!: TopNavComponent;
  @ViewChild('appDrawer', {static: true}) appDrawer: ElementRef | undefined;
  @HostBinding('class') componentCssClass: any | undefined;
  subscription: Subscription | undefined;
  navOpened = true;

  isExpanded = false;
  private previousModuleName: string | null = null;

  get navItems() {
    return this.navService.navItems;
  }

  get imgSrc() {
    return environment.LOADING_IMAGE;
  }

  get isEmbedded() {
    return environment.IS_EMBEDDED;
  }

  constructor(
    protected injector: Injector,
    protected overlayContainer: OverlayContainer,
    protected navService: NavService,
    protected router: Router,
    protected apiService: ApiService,
    protected authoritiesService: AuthoritiesService,
    protected matDialog: MatDialog,
    protected authenticationService: AuthenticationService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected translate: TranslateService) {
    translate.setDefaultLang('vi'); // Ngôn ngữ mặc định
    translate.use('vi'); // Sử dụng ngôn ngữ mặc định
  }

  ngOnInit() {
    this.authenticationService.checkAuthentication();
    // reload component
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };

    this.navService.isExpanded$.subscribe((isExpanded: boolean) => {
      this.isExpanded = isExpanded;
    });

    this.closeNavSideBar(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe((event: any) => {
      this.closeNavSideBar(event.url);
    });

  }

  ngAfterViewInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      const moduleName = this.router.url.split('/')[1];
      if(moduleName === '' || moduleName === 'home') return;
      if(this.previousModuleName !== moduleName) {
        this.previousModuleName = moduleName;
        this.loadMenu(moduleName);
      }
    });
  }

  loadMenu(moduleName: string) {
    const me = this.authoritiesService.me?.userAuthentication ? this.authoritiesService.me : null;

    if(!me) return;

    sessionStorage.setItem('currentUser', JSON.stringify(me.userAuthentication?.principal));

    this.apiService.getJSON<NavigatorModel[]>(`assets/menus/${moduleName}.json`).subscribe((data: NavigatorModel[]) => {
      let menus = [];
      if(me.userAuthentication?.principal?.roles)
        for(const role of me.userAuthentication.principal.roles) {
          if(role.menus)
            menus.push(...role.menus);
        }

      menus = menus.filter(menu => menu.appType === 'WEB');
      data = this.permissionCheckingUtil.isSystemAdmin() ? data : this.getRoleMenu(data, menus);

      this.navService.navItems = data;
      this.navService.navItems.unshift({
        displayName: 'menu.home',
        iconName: 'far fa-home',
        route: 'home',
        roleMenu: '',
        isOnlyIcon: false,
        expanded: false,
      });

      this.onMouseLeave();

      if(me.userAuthentication?.principal?.mustChangePassword) {
        this.matDialog.open(ChangePasswordComponent, {
          width: '80%',
          height: '80%',
        });
      }
    });
  }

  closeNavSideBar(url: string) {
    this.navOpened = !['/home', '/404', '/'].includes(url);
    this.injector.get(ChangeDetectorRef).markForCheck();
  }

  getRoleMenu(navItems: NavigatorModel[], menus: MenuModel[]) {
    const result = [];
    for(const navItem of navItems) {
      const flag = menus.filter(menu => !navItem.roleMenu || menu.code === navItem.roleMenu);
      if(flag && flag.length > 0) {
        if(navItem.children && navItem.children.length > 0) {
          navItem.children = this.getRoleMenu(navItem.children, menus);
        }
        result.push(navItem);
      } else if((!menus || menus.length === 0) && !navItem.roleMenu) {
        result.push(navItem);
      }
    }
    return result;
  }

  changeTheme(theme: any) {
    const overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
    const themeClassesToRemove = Array.from(overlayContainerClasses).filter(
      (item: string) => item !== 'cdk-overlay-container');
    if(themeClassesToRemove.length) {
      overlayContainerClasses.remove(...themeClassesToRemove);
    }
    overlayContainerClasses.add(theme);
    this.componentCssClass = theme;
    const body = document.getElementsByTagName('body')[0];
    body.removeAttribute('class');
    body.classList.add(theme);

    if(theme === 'zeus') {
      const div = document.createElement('div') as HTMLDivElement;
      div.id = 'night_stars';
      body.prepend(div);
    } else {
      const div = document.getElementById('night_stars');
      if(div != null) {
        body.removeChild(div);
      }
    }
  }

  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.subscription?.unsubscribe();
    this.navService.closeNav();
  }

  onMouseEnter() {
    this.navService.navItems?.forEach(item => {
      item.isOnlyIcon = false;
    });
  }

  onMouseLeave() {
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any) {
    if(event.target.className !== 'username' && !event.target.closest('.username')) {
      this.topNav?.userName.nativeElement.classList.add('off');
    }
  }

  switchLanguage(language: string) {
    this.translate.use(language); // Chuyển đổi ngôn ngữ
  }

  toggleSidebar(): void {
    if(this.isExpanded) {
      this.navService.closeNav();
    } else {
      this.navService.openNav();
    }
  }
}
