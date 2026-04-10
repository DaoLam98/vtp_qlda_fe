import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PageNotFoundComponent} from './modules/page-not-found/page-not-found.component';
import {LogoutComponent} from 'src/app/layouts/auth/logout/logout.component';
import {HomeComponent} from 'src/app/modules/hub/home/home.component';
import {AuthoritiesResolverService} from '@c10t/nice-component-library';
import {CallbackSSOComponent} from './shared/components/callback-sso/callback-sso.component';
import {ForbiddenComponent} from "src/app/shared/components/forbidden/forbidden.component";
import {environment} from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}})
  },
  {
    path: 'home',
    component: HomeComponent,
    ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}})
  },
  {
    path: 'mdm',
    data: {
      breadcrumb: 'Danh mục',
      title: 'Danh muc'
    },
    loadChildren: () => import('./modules/mdm/mdm.module').then(m => m.MdmModule)
  },
  {
    path: 'project',
    data: {
      breadcrumb: 'Thông tin dự án',
      title: 'Thông tin dự án'
    },
    loadChildren: () => import('./modules/project-information/project-information.module').then(m => m.ProjectInformationModule)
  },
  {
    path: 'auth/callback',
    component: CallbackSSOComponent,
    data: {title: 'Callback'},
    // Không áp dụng AuthGuard cho route callback
  },
  {
    path: 'logout',
    component: LogoutComponent,
    data: {title: 'Dang xuat'}
  },
  {
    path: '403',
    component: ForbiddenComponent
  },
  {
    path: '404',
    component: PageNotFoundComponent
  },
  {
    path: '**',
    redirectTo: '/404'
  }, // Redirect đến trang 404
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
        useHash: true,
        onSameUrlNavigation: 'reload',
        // preloadingStrategy: PreloadAllModules,
      },
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
