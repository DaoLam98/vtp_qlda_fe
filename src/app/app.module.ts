import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {ObserversModule} from '@angular/cdk/observers';
import {OverlayModule} from '@angular/cdk/overlay';
import {PlatformModule} from '@angular/cdk/platform';
import {PortalModule} from '@angular/cdk/portal';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {DatePipe, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoaderInterceptor, NiceComponentLibraryModule} from '@c10t/nice-component-library';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';
import {ToastrModule} from 'ngx-toastr';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {MockApiInterceptor} from './core/interceptors/mock-api.interceptor';
import {
  AuthenticationService,
  ErrorInterceptor,
  GlobalErrorHandler,
  NavService,
  TranslateLoaderFactoryHelper,
} from './core';
import {CallbackSSOComponent, ChangePasswordComponent, LoginComponent, SharedModule} from './shared';
import {AppRoutingModule} from './app-routing.module';
import {LogoutComponent} from './layouts/auth/logout/logout.component';
import {HomeComponent} from 'src/app/modules/hub/home/home.component';
import {
  PersonalInformationComponent,
} from './shared/components/dialogs/personal-information/personal-information.component';
import {
  InputConfirmDialogComponent,
} from 'src/app/shared/components/dialogs/input-confirm-dialog/input-confirm-dialog.component';
import {TopNavComponent} from 'src/app/layouts/top-nav/top-nav.component';

@NgModule({
  exports: [
    // CDK
    A11yModule,
    BidiModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    CdkStepperModule,
    CdkTableModule,
  ],
  declarations: [
    AppComponent,
    TopNavComponent,
    ChangePasswordComponent,
    LoginComponent,
    LogoutComponent,
    HomeComponent,
    CallbackSSOComponent,
    PersonalInformationComponent,
    InputConfirmDialogComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    /*ONLY ONCE TIME*/
    BrowserModule,
    BrowserAnimationsModule,
    NiceComponentLibraryModule.forRoot({
      data: {
        BASE_URL: environment.BASE_URL,
        BASE_AUTHORIZATION_URL: environment.BASE_AUTHORIZATION_URL,
        PAGE_SIZE: environment.PAGE_SIZE,
        PAGE_SIZE_OPTIONS: environment.PAGE_SIZE_OPTIONS,
        API_DATE_FORMAT: environment.API_DATE_FORMAT,
        DIS_DATE_FORMAT: environment.DIS_DATE_FORMAT,
        DIALOG_LOGO: '' /*environment.DIALOG_LOGO*/,
        STYLE_DISABLE: 'TEXT',
      },
    }),
    ToastrModule.forRoot(), // ToastrModule added
    TranslateModule.forRoot({
      defaultLanguage: environment.DEFAULT_LANGUAGE,
      loader: {
        provide: TranslateLoader,
        useClass: TranslateLoaderFactoryHelper.forModule(),
        deps: [HttpClient],
      },
      isolate: false,
    }),
    SharedModule,
    AppRoutingModule,
    NiceComponentLibraryModule,
  ],
  providers: [
    ...(environment.MOCK_API
      ? ([
        {
          provide: HTTP_INTERCEPTORS,
          useClass: MockApiInterceptor,
          multi: true
        },
      ] as any[])
      : []),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    // { provide: HTTP_INTERCEPTORS, useClass: JsogHttpInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    // { provide: 'PowerBIService', useFactory: powerBiServiceFactory }, // To inject a instance of pbi client library
    // JsogService,
    DatePipe,
    CookieService,
    AuthenticationService,
    NavService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {
}
