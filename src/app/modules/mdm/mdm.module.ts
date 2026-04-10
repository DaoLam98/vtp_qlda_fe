import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {QuillModule} from 'ngx-quill';
import {SharedModule} from 'src/app/shared';
import {HttpClient} from '@angular/common/http';
import {TranslateLoaderFactoryHelper} from 'src/app/core';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {DashboardComponent} from 'src/app/modules/mdm/dashboard/dashboard.component';
import {
  FileTemplateSearchComponent
} from 'src/app/modules/mdm/file-template/file-template-search/file-template-search.component';
import {LocationSearchComponent} from 'src/app/modules/mdm/location/location-search/location-search.component';
import {PartnerSearchComponent} from 'src/app/modules/mdm/partner/partner-search/partner-search.component';
import {ModuleAddEditDetailComponent} from './module/module-add-edit-detail/module-add-edit-detail.component';
import {ModuleSearchComponent} from './module/module-search/module-search.component';
import {LanguageSearchComponent} from 'src/app/modules/mdm/language/language-search/language-search.component';
import {
  LocationAddEditDetailComponent
} from 'src/app/modules/mdm/location/location-add-edit-detail/location-add-edit-detail.component';
import {UnitSearchComponent} from 'src/app/modules/mdm/unit/unit-search/unit-search.component';
import {UnitAddEditDetailComponent} from 'src/app/modules/mdm/unit/unit-add-edit-detail/unit-add-edit-detail.component';
import {
  PartnerAddEditDetailComponent
} from 'src/app/modules/mdm/partner/partner-add-edit-detail/partner-add-edit-detail.component';
import {MenuSearchComponent} from 'src/app/modules/mdm/menu/menu-search/menu-search.component';
import {MenuAddEditDetailComponent} from 'src/app/modules/mdm/menu/menu-add-edit-detail/menu-add-edit-detail.component';
import {
  LanguageAddEditDetailComponent
} from 'src/app/modules/mdm/language/language-add-edit-detail/language-add-edit-detail.component';
import {RoleSearchComponent} from 'src/app/modules/mdm/role/role-search/role-search.component';
import {RoleAddEditDetailComponent} from 'src/app/modules/mdm/role/role-add-edit-detail/role-add-edit-detail.component';
import {ExternalUserComponent} from './user/external/external-user.component';
import {InternalUserComponent} from './user/internal/internal-user.component';
import {MdmRoutingModule} from './mdm.routing.module';
import {
  NotificationTemplateSearchComponent
} from './notification-template/notification-template-search/notification-template-search.component';
import {
  NotificationTemplateAddEditDetailComponent
} from './notification-template/notification-template-add-edit-detail/notification-template-add-edit-detail.component';
import {TranslationKeySearchComponent} from './translate-key/translation-key-search/translation-key-search.component';
import {
  TranslationKeyAddEditDetailComponent
} from './translate-key/translation-key-add-edit-detail/translation-key-add-edit-detail.component';
import {
  FileTemplateAddEditDetailComponent
} from 'src/app/modules/mdm/file-template/file-template-add-edit-detail/file-template-add-edit-detail.component';
import {
  InternalUserAddEditDetailComponent
} from 'src/app/modules/mdm/user/internal/internal-user-add-edit-detail/internal-user-add-edit-detail.component';
import {
  ExternalUserAddEditDetailComponent
} from 'src/app/modules/mdm/user/external/external-user-add-edit-detail/external-user-add-edit-detail.component';
import {OrganizationComponent} from './organization/organization.component';
import {JobPositionSearchComponent} from './job-position/job-position-search/job-position-search.component';
import {
  JobPositionAddEditDetailComponent
} from './job-position/job-position-add-edit-detail/job-position-add-edit-detail.component';
import {PermissionSearchComponent} from 'src/app/modules/mdm/permission/permission-search/permission-search.component';
import {PermissionDetailComponent} from 'src/app/modules/mdm/permission/permission-detail/permission-detail.component';
import {CurrencySearchComponent} from './currency/currency-search/currency-search.component';
import {CurrencyAddEditDetailComponent} from './currency/currency-add-edit-detail/currency-add-edit-detail.component';
import {
  PopupChooseExternalUserComponent
} from './user/external/external-user-popup-choosen/external-user-popup-choosen.component';
import {
  OrganizationEditDetailComponent
} from 'src/app/modules/mdm/organization/organization-edit-detail/organization-edit-detail.component';
import {
  JobPositionGroupAddEditDetailComponent
} from "src/app/modules/mdm/job-position-group/job-position-group-add-edit-detail/job-position-group-add-edit-detail.component";
import {
  JobPositionGroupSearchComponent
} from "src/app/modules/mdm/job-position-group/job-position-group-search/job-position-group-search.component";
import {ConfigVoSearchComponent} from "src/app/modules/mdm/config-vo/config-vo-search/config-vo-search.component";
import {
  ConfigVoAddEditDetailComponent
} from "src/app/modules/mdm/config-vo/config-vo-add-edit-detail/config-vo-add-edit-detail.component";
import {AttributeSearchComponent} from "src/app/modules/mdm/attribute/attribute-search/attribute-search.component";
import {
  AttributeAddEditDetailComponent
} from "src/app/modules/mdm/attribute/attribute-add-edit-detail/attribute-add-edit-detail.component";
import {
  AssetsAddEditDetailComponent
} from "src/app/modules/mdm/assets/assets-add-edit-detail/assets-add-edit-detail.component";
import {AssetsSearchComponent} from "src/app/modules/mdm/assets/assets-search/assets-search.component";
import {
  AssetGroupSearchComponent
} from "src/app/modules/mdm/asset-group/asset-group-search/asset-group-search.component";
import {
  AssetGroupAddEditDetailComponent
} from "src/app/modules/mdm/asset-group/asset-group-add-edit-detail/asset-group-add-edit-detail.component";
import {
  TargetGroupSearchComponent
} from 'src/app/modules/mdm/target-group/target-group-search/target-group-search.component';
import {
  TargetGroupAddEditDetailComponent
} from 'src/app/modules/mdm/target-group/target-group-add-edit-detail/target-group-add-edit-detail.component';
import {TargetSearchComponent} from 'src/app/modules/mdm/target/target-search/target-search.component';
import {
  TargetAddEditDetailComponent
} from 'src/app/modules/mdm/target/target-add-edit-detail/target-add-edit-detail.component';
import {
  PeriodTypeSearchComponent
} from 'src/app/modules/mdm/period-type/period-type-search/period-type-search.component';
import {
  PeriodTypeAddEditDetailComponent
} from 'src/app/modules/mdm/period-type/period-type-add-edit-detail/period-type-add-edit-detail.component';
import { CycleManagementSearchComponent } from './cycle-management/cycle-management-search/cycle-management-search.component';
import {
  AccountingAccountSearchComponent
} from 'src/app/modules/mdm/acounting-account/accounting-account-search/accounting-account-search.component';
import {
  AccountingAccountAddEditDetailComponent
} from 'src/app/modules/mdm/acounting-account/accounting-account-add-edit-detail/accounting-account-add-edit-detail.component';
import { PopupAddCycleManagementComponent } from './cycle-management/popup-add-cycle-management/popup-add-cycle-management.component';
import { CycleManagementAddEditDetailComponent } from './cycle-management/cycle-management-add-edit-detail/cycle-management-add-edit-detail.component';
import {
  InvestmentFormSearchComponent
} from "src/app/modules/mdm/investment-form/investment-form-search/investment-form-search.component";
import {
  InvestmentFormAddEditDetailComponent
} from "src/app/modules/mdm/investment-form/investment-form-add-edit-detail/investment-form-add-edit-detail.component";
import {DataTypeSearchComponent} from "src/app/modules/mdm/data-type/data-type-search/data-type-search.component";
import {
  DataTypeAddEditDetailComponent
} from "src/app/modules/mdm/data-type/data-type-add-edit-detail/data-type-add-edit-detail.component";
import {
  ProgressEvaluationSearchComponent
} from "src/app/modules/mdm/progress-evaluation/progress-evaluation-search/progress-evaluation-search.component";
import {
  ProgressEvaluationAddEditDetailComponent
} from "src/app/modules/mdm/progress-evaluation/progress-evaluation-add-edit-detail/progress-evaluation-add-edit-detail.component";
import {TaxSearchComponent} from 'src/app/modules/mdm/tax/tax-search/tax-search.component';
import {TaxAddEditDetailComponent} from 'src/app/modules/mdm/tax/tax-add-edit-detail/tax-add-edit-detail.component';
import {
  TemplateTypeSearchComponent
} from 'src/app/modules/mdm/template-type/template-type-search/template-type-search.component';
import {
  TemplateTypeAddEditDetailComponent
} from 'src/app/modules/mdm/template-type/template-type-add-edit-detail/template-type-add-edit-detail.component';
import {
  ProjectTypeSearchComponent
} from 'src/app/modules/mdm/project-type/project-type-search/project-type-search.component';
import {
  ProjectTypeAddEditDetailComponent
} from 'src/app/modules/mdm/project-type/project-type-add-edit-detail/project-type-add-edit-detail.component';
import { ConsolidatedAccountSearchComponent } from './consolidated-account/consolidated-account-search/consolidated-account-search.component';
import { ConsolidatedAccountAddEditDetailComponent } from './consolidated-account/consolidated-account-add-edit-detail/consolidated-account-add-edit-detail.component';
import {
  FormConfigurationSearchComponent
} from "src/app/modules/mdm/form-configuration/form-configuration-search/form-configuration-search.component";
import {
  FormConfigurationAddEditDetailComponent
} from "src/app/modules/mdm/form-configuration/form-configuration-add-edit-detail/form-configuration-add-edit-detail.component";
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyCalculateModule } from 'src/app/modules/mdm/target/formly-calculate/formly-calculate.module';
import {
  CalculateFormComponent
} from 'src/app/modules/mdm/target/formly-calculate/query-builder-form/calculate-form.component';
import { PopupExpressionDetailsComponent } from './form-configuration/popup-expression-details/popup-expression-details.component';
import { PopupAddColorComponent } from 'src/app/modules/mdm/target/popup-add-color/popup-add-color.component';
import {
  InvestmentLimitSearchComponent
} from 'src/app/modules/mdm/inventment-limit/investment-limit-search/investment-limit-search.component';
import {
  InvestmentLimitAddEditDetailComponent
} from 'src/app/modules/mdm/inventment-limit/investment-limit-add-edit-detail/investment-limit-add-edit-detail.component';
import { ScheduleJobAddEditDetailComponent } from './schedule-job/schedule-job-add-edit-detail/schedule-job-add-edit-detail.component';
import { ScheduleJobSearchComponent } from './schedule-job/schedule-job-search/schedule-job-search.component';

export function translateLoaderFactory(http: HttpClient): any {
  return new (TranslateLoaderFactoryHelper.forModule(ModuleNameEnum.MDM))(http);
}

@NgModule({
  declarations: [
    DashboardComponent,
    FileTemplateSearchComponent,
    LocationSearchComponent,
    LocationAddEditDetailComponent,
    PartnerSearchComponent,
    PartnerAddEditDetailComponent,
    ModuleAddEditDetailComponent,
    ModuleSearchComponent,
    LanguageSearchComponent,
    LanguageAddEditDetailComponent,
    UnitSearchComponent,
    UnitAddEditDetailComponent,
    MenuSearchComponent,
    MenuAddEditDetailComponent,
    RoleSearchComponent,
    RoleAddEditDetailComponent,
    ExternalUserComponent,
    InternalUserComponent,
    NotificationTemplateSearchComponent,
    NotificationTemplateAddEditDetailComponent,
    TranslationKeySearchComponent,
    TranslationKeyAddEditDetailComponent,
    ExternalUserAddEditDetailComponent,
    InternalUserAddEditDetailComponent,
    FileTemplateAddEditDetailComponent,
    OrganizationComponent,
    OrganizationEditDetailComponent,
    JobPositionSearchComponent,
    JobPositionAddEditDetailComponent,
    PermissionSearchComponent,
    PermissionDetailComponent,
    PermissionDetailComponent,
    CurrencySearchComponent,
    CurrencyAddEditDetailComponent,
    PopupChooseExternalUserComponent,
    CurrencyAddEditDetailComponent,
    JobPositionGroupSearchComponent,
    JobPositionGroupAddEditDetailComponent,
    ConfigVoSearchComponent,
    ConfigVoAddEditDetailComponent,
    AttributeSearchComponent,
    AttributeAddEditDetailComponent,
    AssetsAddEditDetailComponent,
    AssetsSearchComponent,
    AssetGroupSearchComponent,
    AssetGroupAddEditDetailComponent,
    AttributeAddEditDetailComponent,
    TargetGroupSearchComponent,
    TargetGroupAddEditDetailComponent,
    TargetSearchComponent,
    TargetAddEditDetailComponent,
    PeriodTypeSearchComponent,
    PeriodTypeAddEditDetailComponent,
    CycleManagementSearchComponent,
    AccountingAccountSearchComponent,
    AccountingAccountAddEditDetailComponent,
    PopupAddCycleManagementComponent,
    CycleManagementAddEditDetailComponent,
    InvestmentFormSearchComponent,
    InvestmentFormAddEditDetailComponent,
    DataTypeSearchComponent,
    DataTypeAddEditDetailComponent,
    ProgressEvaluationSearchComponent,
    ProgressEvaluationAddEditDetailComponent,
    TaxSearchComponent,
    TaxAddEditDetailComponent,
    TemplateTypeSearchComponent,
    TemplateTypeAddEditDetailComponent,
    ProjectTypeSearchComponent,
    ProjectTypeAddEditDetailComponent,
    ConsolidatedAccountSearchComponent,
    ConsolidatedAccountAddEditDetailComponent,
    FormConfigurationSearchComponent,
    FormConfigurationAddEditDetailComponent,
    FormConfigurationSearchComponent,
    FormConfigurationAddEditDetailComponent,
    PopupExpressionDetailsComponent,
    PopupAddColorComponent,
    InvestmentLimitSearchComponent,
    InvestmentLimitAddEditDetailComponent,
    ScheduleJobSearchComponent,
    ScheduleJobAddEditDetailComponent,
  ],
  imports: [
    SharedModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
      extend: true,
    }),
    MdmRoutingModule,
    QuillModule.forRoot(),
    CalculateFormComponent,
    FormlyModule.forRoot(),
    FormlyModule.forRoot({
      validationMessages: [
        { name: 'required', message: 'Chưa nhập thông tin' },
      ],
    }),
    FormlyMaterialModule,
    FormlyCalculateModule
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MdmModule {
}
