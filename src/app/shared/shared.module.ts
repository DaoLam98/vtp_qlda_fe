import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {FileSaverModule} from 'ngx-filesaver';
import {FlexLayoutModule} from '@angular/flex-layout';
import {NiceComponentLibraryModule, SingletonTranslateService, UtilsService} from '@c10t/nice-component-library';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {QuillModule} from 'ngx-quill';
import {PortalModule} from '@angular/cdk/portal';
import {environment} from 'src/environments/environment';
import {MaterialModule} from './material.module';
import {CloudSearchComponent} from 'src/app/shared/components/base-search/cloud-search.component';
import {RouterLink, RouterModule} from '@angular/router';
import {CoreModule} from 'src/app/core';
import {MenuListItemComponent} from 'src/app/layouts/menu-list-item/menu-list-item.component';
import {AppTemplateDirective} from './directives/app-template.directive';
import {UserTreeComponent} from 'src/app/shared/components/internal-user/user-tree/user-tree.component';
import {OrganizationTreeComponent} from './components/organization/organization-tree/organization-tree.component';
import {
  PopupChooseOrganizationComponent
} from './components/organization/organization-popup-choosen/organization-popup-choosen.component';
import {
  PopupChooseUserComponent
} from 'src/app/shared/components/internal-user/popup-choose-user/popup-choose-user.component';
import {SignTemplateComponent} from 'src/app/shared/components/sign-template/sign-template.component';
import {
  ChangePasswordVoComponent
} from 'src/app/shared/components/dialogs/change-password-vo/change-password-vo.component';
import {VssFilesFieldComponent} from 'src/app/shared/components/vss-files-field/vss-files-field.component';
import {VssToggleFieldComponent} from 'src/app/shared/components/vss-toggle-field/vss-toggle-field.component';
import {VssHashtagsFieldComponent} from 'src/app/shared/components/vss-hashtags-field/vss-hashtags-field.component';
import {
  AutocompleteDialogFieldComponent
} from 'src/app/shared/components/autocomplete-dialog-field/autocomplete-dialog-field.component';
import {ImagesCarouselComponent} from './components/images-carousel/images-carousel.component';
import {
  CompositeChooseInternalUserComponent,
} from './components/internal-user/internal-user-composite-choosen/internal-user-composite-choosen.component';
import {
  CompositeChooseOrganizationComponent,
} from './components/organization/organization-composit-choosen/organization-composit-choosen.component';
import {PdfJsViewerModule} from 'ng2-pdfjs-viewer';
import {PaginatorComponent} from './components/paginator/paginator.component';
import {OtpDialogComponent} from 'src/app/shared/components/otp-dialog/otp-dialog.component';
import {ExpandPanelActionDirective} from 'src/app/shared/directives/expand-panel-action.directive';
import { AccountTreeComponent } from './components/account/account-tree/account-tree.component';
import {
  PopupChooseAccountComponent
} from 'src/app/shared/components/account/account-popup-choosen/account-popup-chosen.component';
import { BlockCharsDirective } from './directives/block-chars.directive';
import { BlockMaxLengthDirective } from './directives/block-max-length.directive';
import { ProjectItemSearchComponent } from './components/project-item-search/project-item-search.component';
import { PopupAddItemComponent } from './components/project-item-search/popup-add-item/popup-add-item.component';
import { LocationTreeComponent } from './components/location/location-tree/location-tree.component';
import { PopupChooseLocationComponent } from './components/location/popup-choose-location/popup-choose-location.component';
import {CompositeChooseLocationComponent} from './components/location/location-composite-choosen/location-composite-choosen.component';
import { PopupUploadComponent } from './components/project-item-search/popup-upload/popup-upload.component';
import {SubmissionHistoryDialogComponent} from "src/app/shared/components/submission-history-dialog/submission-history-dialog.component";

@NgModule({
  declarations: [
    CloudSearchComponent,
    MenuListItemComponent,
    AppTemplateDirective,
    UserTreeComponent,
    OrganizationTreeComponent,
    PopupChooseOrganizationComponent,
    PopupChooseUserComponent,
    VssFilesFieldComponent,
    VssToggleFieldComponent,
    ChangePasswordVoComponent,
    SignTemplateComponent,
    VssHashtagsFieldComponent,
    AutocompleteDialogFieldComponent,
    ImagesCarouselComponent,
    CompositeChooseInternalUserComponent,
    CompositeChooseOrganizationComponent,
    PaginatorComponent,
    OtpDialogComponent,
    ExpandPanelActionDirective,
    AccountTreeComponent,
    PopupChooseAccountComponent,
    BlockCharsDirective,
    BlockMaxLengthDirective,
    ProjectItemSearchComponent,
    PopupAddItemComponent,
    PopupChooseLocationComponent,
    CompositeChooseLocationComponent,
    LocationTreeComponent,
    PopupUploadComponent,
    LocationTreeComponent,
    SubmissionHistoryDialogComponent
  ],
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FileSaverModule,
    FlexLayoutModule,
    MaterialModule,
    NiceComponentLibraryModule,
    TranslateModule,
    QuillModule.forRoot(),
    PortalModule,
    RouterLink,
    RouterModule,
    CoreModule,
    PdfJsViewerModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FileSaverModule,
    FlexLayoutModule,
    MaterialModule,
    NiceComponentLibraryModule,
    QuillModule,
    CloudSearchComponent,
    CoreModule,
    MenuListItemComponent,
    AppTemplateDirective,
    UserTreeComponent,
    OrganizationTreeComponent,
    PopupChooseOrganizationComponent,
    PopupChooseUserComponent,
    VssFilesFieldComponent,
    VssToggleFieldComponent,
    SignTemplateComponent,
    ChangePasswordVoComponent,
    VssHashtagsFieldComponent,
    AutocompleteDialogFieldComponent,
    ImagesCarouselComponent,
    CompositeChooseInternalUserComponent,
    CompositeChooseOrganizationComponent,
    PaginatorComponent,
    OtpDialogComponent,
    ExpandPanelActionDirective,
    AccountTreeComponent,
    PopupChooseAccountComponent,
    BlockCharsDirective,
    BlockMaxLengthDirective,
    ProjectItemSearchComponent,
    PopupAddItemComponent,
    LocationTreeComponent,
    PopupChooseLocationComponent,
    CompositeChooseLocationComponent,
    PopupUploadComponent,
    SubmissionHistoryDialogComponent
  ],
  providers: [UtilsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {
  constructor(private translate: TranslateService, protected singletonTranslateService: SingletonTranslateService) {
    if(!window.sessionStorage.getItem('lang' + environment.CLIENT_ID) || window.sessionStorage.getItem(
      'lang' + environment.CLIENT_ID) === '') {
      window.sessionStorage.setItem('lang' + environment.CLIENT_ID, environment.DEFAULT_LANGUAGE);
      translate.setDefaultLang(environment.DEFAULT_LANGUAGE);
      singletonTranslateService.currentLanguage.next(environment.DEFAULT_LANGUAGE);
    } else {
      singletonTranslateService.currentLanguage.next(
        '' + window.sessionStorage.getItem('lang' + environment.CLIENT_ID));
    }
    singletonTranslateService.currentLanguage$.subscribe((lang: string) => {
      this.translate.use(lang);
    });
  }
}
