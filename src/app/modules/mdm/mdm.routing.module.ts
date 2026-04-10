import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthoritiesResolverService} from '@c10t/nice-component-library';
import {DashboardComponent} from 'src/app/modules/mdm/dashboard/dashboard.component';
import {environment} from 'src/environments/environment';
import {
  FileTemplateSearchComponent,
} from 'src/app/modules/mdm/file-template/file-template-search/file-template-search.component';
import {
  LanguageAddEditDetailComponent,
} from 'src/app/modules/mdm/language/language-add-edit-detail/language-add-edit-detail.component';
import {LanguageSearchComponent} from 'src/app/modules/mdm/language/language-search/language-search.component';
import {
  LocationAddEditDetailComponent,
} from 'src/app/modules/mdm/location/location-add-edit-detail/location-add-edit-detail.component';
import {LocationSearchComponent} from 'src/app/modules/mdm/location/location-search/location-search.component';
import {
  MenuAddEditDetailComponent,
} from 'src/app/modules/mdm/menu/menu-add-edit-detail/menu-add-edit-detail.component';
import {MenuSearchComponent} from 'src/app/modules/mdm/menu/menu-search/menu-search.component';
import {
  PartnerAddEditDetailComponent,
} from 'src/app/modules/mdm/partner/partner-add-edit-detail/partner-add-edit-detail.component';
import {PartnerSearchComponent} from 'src/app/modules/mdm/partner/partner-search/partner-search.component';
import {
  RoleAddEditDetailComponent,
} from 'src/app/modules/mdm/role/role-add-edit-detail/role-add-edit-detail.component';
import {RoleSearchComponent} from 'src/app/modules/mdm/role/role-search/role-search.component';
import {
  UnitAddEditDetailComponent,
} from 'src/app/modules/mdm/unit/unit-add-edit-detail/unit-add-edit-detail.component';
import {UnitSearchComponent} from 'src/app/modules/mdm/unit/unit-search/unit-search.component';
import {ActionTypeEnum} from 'src/app/shared';
import {ModuleAddEditDetailComponent} from './module/module-add-edit-detail/module-add-edit-detail.component';
import {ModuleSearchComponent} from './module/module-search/module-search.component';
import {
  NotificationTemplateAddEditDetailComponent,
} from './notification-template/notification-template-add-edit-detail/notification-template-add-edit-detail.component';
import {
  NotificationTemplateSearchComponent,
} from './notification-template/notification-template-search/notification-template-search.component';
import {ExternalUserComponent} from './user/external/external-user.component';
import {InternalUserComponent} from './user/internal/internal-user.component';
import {TranslationKeySearchComponent} from './translate-key/translation-key-search/translation-key-search.component';
import {
  TranslationKeyAddEditDetailComponent,
} from './translate-key/translation-key-add-edit-detail/translation-key-add-edit-detail.component';
import {
  FileTemplateAddEditDetailComponent,
} from 'src/app/modules/mdm/file-template/file-template-add-edit-detail/file-template-add-edit-detail.component';
import {
  InternalUserAddEditDetailComponent,
} from 'src/app/modules/mdm/user/internal/internal-user-add-edit-detail/internal-user-add-edit-detail.component';
import {
  ExternalUserAddEditDetailComponent,
} from 'src/app/modules/mdm/user/external/external-user-add-edit-detail/external-user-add-edit-detail.component';
import {OrganizationComponent} from './organization/organization.component';
import {
  JobPositionAddEditDetailComponent,
} from './job-position/job-position-add-edit-detail/job-position-add-edit-detail.component';
import {JobPositionSearchComponent} from './job-position/job-position-search/job-position-search.component';
import {PermissionSearchComponent,} from 'src/app/modules/mdm/permission/permission-search/permission-search.component';
import {PermissionDetailComponent,} from 'src/app/modules/mdm/permission/permission-detail/permission-detail.component';
import {CurrencySearchComponent} from './currency/currency-search/currency-search.component';
import {CurrencyAddEditDetailComponent} from './currency/currency-add-edit-detail/currency-add-edit-detail.component';
import {
  OrganizationEditDetailComponent
} from 'src/app/modules/mdm/organization/organization-edit-detail/organization-edit-detail.component';
import {
  JobPositionGroupSearchComponent
} from "src/app/modules/mdm/job-position-group/job-position-group-search/job-position-group-search.component";
import {
  JobPositionGroupAddEditDetailComponent
} from "src/app/modules/mdm/job-position-group/job-position-group-add-edit-detail/job-position-group-add-edit-detail.component";
import {ConfigVoSearchComponent} from "src/app/modules/mdm/config-vo/config-vo-search/config-vo-search.component";
import {
  ConfigVoAddEditDetailComponent
} from "src/app/modules/mdm/config-vo/config-vo-add-edit-detail/config-vo-add-edit-detail.component";
import {AttributeSearchComponent} from "src/app/modules/mdm/attribute/attribute-search/attribute-search.component";
import {
  AttributeAddEditDetailComponent
} from "src/app/modules/mdm/attribute/attribute-add-edit-detail/attribute-add-edit-detail.component";
import {AssetsSearchComponent} from "src/app/modules/mdm/assets/assets-search/assets-search.component";
import {
  AssetsAddEditDetailComponent
} from "src/app/modules/mdm/assets/assets-add-edit-detail/assets-add-edit-detail.component";
import {
  AssetGroupSearchComponent
} from "src/app/modules/mdm/asset-group/asset-group-search/asset-group-search.component";
import {
  AssetGroupAddEditDetailComponent
} from "src/app/modules/mdm/asset-group/asset-group-add-edit-detail/asset-group-add-edit-detail.component";
import {
  TargetGroupAddEditDetailComponent
} from 'src/app/modules/mdm/target-group/target-group-add-edit-detail/target-group-add-edit-detail.component';
import {
  TargetGroupSearchComponent
} from 'src/app/modules/mdm/target-group/target-group-search/target-group-search.component';
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
import {
  InvestmentLimitAddEditDetailComponent
} from 'src/app/modules/mdm/inventment-limit/investment-limit-add-edit-detail/investment-limit-add-edit-detail.component';
import {
  InvestmentLimitSearchComponent
} from 'src/app/modules/mdm/inventment-limit/investment-limit-search/investment-limit-search.component';
import { ScheduleJobSearchComponent } from './schedule-job/schedule-job-search/schedule-job-search.component';
import { ScheduleJobAddEditDetailComponent } from './schedule-job/schedule-job-add-edit-detail/schedule-job-add-edit-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    ...(environment.MOCK_API ? {} : {resolve: {me: AuthoritiesResolverService}}),
  },
  {
    path: 'attribute',
    data: {breadcrumb: 'menu.mdm.attribute'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AttributeSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: AttributeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.attribute.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: AttributeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.attribute.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: AttributeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.attribute.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'config-vo',
    data: {breadcrumb: 'menu.mdm.config-vo'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ConfigVoSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ConfigVoAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.config-vo.add',
          actionType: ActionTypeEnum._ADD
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ConfigVoAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.config-vo.detail',
          actionType: ActionTypeEnum._VIEW
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ConfigVoAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.config-vo.edit',
          actionType: ActionTypeEnum._EDIT
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ]
  },
  {
    path: 'assets',
    data: {breadcrumb: 'menu.mdm.property'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AssetsSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: AssetsAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: AssetsAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: AssetsAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },

  {
    path: 'asset-group',
    data: {breadcrumb: 'menu.mdm.property-group'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AssetGroupSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: AssetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property-group.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: AssetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property-group.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: AssetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.property-group.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'investment-form',
    data: {breadcrumb: 'menu.mdm.investment-form'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: InvestmentFormSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: InvestmentFormAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-form.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: InvestmentFormAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-form.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: InvestmentFormAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-form.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'data-type',
    data: {breadcrumb: 'menu.mdm.data-type'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DataTypeSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: DataTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.data-type.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: DataTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.data-type.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: DataTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.data-type.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'progress-evaluation',
    data: {breadcrumb: 'menu.mdm.progress-evaluation'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProgressEvaluationSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ProgressEvaluationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.progress-evaluation.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ProgressEvaluationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.progress-evaluation.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ProgressEvaluationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.progress-evaluation.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'currency',
    data: {breadcrumb: 'menu.mdm.currency'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CurrencySearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: CurrencyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.currency.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: CurrencyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.currency.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: CurrencyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.currency.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'file-template',
    data: {breadcrumb: 'menu.mdm.file-template'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: FileTemplateSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: FileTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.file-template.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: FileTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.file-template.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: FileTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.file-template.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'job-position',
    data: {breadcrumb: 'menu.mdm.job-position'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: JobPositionSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: JobPositionAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.job-position.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: JobPositionAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.job-position.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'job-position-group',
    data: {breadcrumb: 'menu.mdm.job-position-group'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: JobPositionGroupSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: JobPositionGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.job-position-group.add',
          actionType: ActionTypeEnum._ADD
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: JobPositionGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.job-position-group.detail',
          actionType: ActionTypeEnum._VIEW
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: JobPositionGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.job-position-group.edit',
          actionType: ActionTypeEnum._EDIT
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ]
  },
  {
    path: 'language',
    data: {breadcrumb: 'menu.mdm.language'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LanguageSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: LanguageAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.language.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: LanguageAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.language.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: LanguageAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.language.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'location',
    data: {breadcrumb: 'menu.mdm.location'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LocationSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: LocationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.location.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: LocationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.location.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: LocationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.location.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'menu',
    data: {breadcrumb: 'menu.mdm.menu'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: MenuSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: MenuAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.menu.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: MenuAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.menu.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: MenuAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.menu.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'module',
    data: {breadcrumb: 'menu.mdm.module'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ModuleSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ModuleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.module.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ModuleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.module.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ModuleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.module.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'notification-template',
    data: {breadcrumb: 'menu.mdm.notification-template'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: NotificationTemplateSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: NotificationTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.notification-template.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: NotificationTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.notification-template.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: NotificationTemplateAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.notification-template.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'organization',
    data: {breadcrumb: 'menu.mdm.organization'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: OrganizationComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: OrganizationEditDetailComponent,
        data: {
          breadcrumb: 'menu.organization.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: OrganizationEditDetailComponent,
        data: {
          breadcrumb: 'menu.organization.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'partner',
    data: {breadcrumb: 'menu.mdm.partner'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PartnerSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: PartnerAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.partner.detail',
          actionType: ActionTypeEnum._VIEW
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: PartnerAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.partner.add',
          actionType: ActionTypeEnum._ADD
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: PartnerAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.partner.edit',
          actionType: ActionTypeEnum._EDIT
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'permissions',
    data: {breadcrumb: 'menu.mdm.permission'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PermissionSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: PermissionDetailComponent,
        data: {
          breadcrumb: 'mdm.permission.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'role',
    data: {breadcrumb: 'menu.mdm.role'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: RoleSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: RoleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.role.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: RoleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.role.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: RoleAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.role.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'translation-key',
    data: {breadcrumb: 'menu.mdm.translation-key'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TranslationKeySearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: TranslationKeyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.translation-key.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: TranslationKeyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.translation-key.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: TranslationKeyAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.translation-key.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'unit-of-measure',
    data: {breadcrumb: 'menu.mdm.unit-of-measure'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: UnitSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: UnitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.unit-of-measure.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: UnitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.unit-of-measure.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: UnitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.unit-of-measure.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'external-user',
    data: {breadcrumb: 'menu.mdm.external-user'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ExternalUserComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ExternalUserAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.external-user.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ExternalUserAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.external-user.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ExternalUserAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.external-user.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'internal-user',
    data: {breadcrumb: 'menu.mdm.internal-user'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: InternalUserComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: InternalUserAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.internal-user.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: InternalUserAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.internal-user.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'target-group',
    data: {breadcrumb: 'menu.mdm.target-group'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TargetGroupSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: TargetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target-group.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: TargetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target-group.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: TargetGroupAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target-group.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'target',
    data: {breadcrumb: 'menu.mdm.target'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TargetSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: TargetAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: TargetAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: TargetAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.target.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'period-type',
    data: {breadcrumb: 'menu.mdm.period-type'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PeriodTypeSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: PeriodTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.period-type.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: PeriodTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.period-type.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: PeriodTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.period-type.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'cycle-management',
    data: {breadcrumb: 'menu.mdm.cycle-management'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CycleManagementSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: CycleManagementAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.cycle-management.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: CycleManagementAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.cycle-management.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'accounting-account',
    data: {breadcrumb: 'menu.mdm.accounting-account'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AccountingAccountSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: AccountingAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.accounting-account.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: AccountingAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.accounting-account.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: AccountingAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.accounting-account.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'tax',
    data: {breadcrumb: 'menu.mdm.tax'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TaxSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: TaxAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.tax.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: TaxAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.tax.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: TaxAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.tax.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'template-type',
    data: {breadcrumb: 'menu.mdm.template-type'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TemplateTypeSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: TemplateTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.template-type.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: TemplateTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.template-type.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: TemplateTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.template-type.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'project-type',
    data: {breadcrumb: 'menu.mdm.project-type'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ProjectTypeSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ProjectTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.project-type.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ProjectTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.project-type.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ProjectTypeAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.project-type.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'consolidated-account',
    data: {breadcrumb: 'menu.mdm.consolidated-account'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ConsolidatedAccountSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: ConsolidatedAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.consolidated-account.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: ConsolidatedAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.consolidated-account.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: ConsolidatedAccountAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.mdm.consolidated-account.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'form-configuration',
    data: {breadcrumb: 'menu.mdm.form-configuration'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: FormConfigurationSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: FormConfigurationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.form-configuration.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: FormConfigurationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.form-configuration.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: FormConfigurationAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.form-configuration.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'investment-limit',
    data: {breadcrumb: 'menu.mdm.investment-limit'},
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: InvestmentLimitSearchComponent,
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'detail/:id',
        component: InvestmentLimitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-limit.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'add',
        component: InvestmentLimitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-limit.add',
          actionType: ActionTypeEnum._ADD,
        },
        resolve: {me: AuthoritiesResolverService},
      },
      {
        path: 'edit/:id',
        component: InvestmentLimitAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.investment-limit.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: {me: AuthoritiesResolverService},
      },
    ],
  },
  {
    path: 'schedule-job',
    data: { breadcrumb: 'menu.mdm.config-schedule-job' },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ScheduleJobSearchComponent,
        resolve: { me: AuthoritiesResolverService },
      },
      {
        path: 'detail/:id',
        component: ScheduleJobAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.config-schedule-job.detail',
          actionType: ActionTypeEnum._VIEW,
        },
        resolve: { me: AuthoritiesResolverService },
      },
      {
        path: 'edit/:id',
        component: ScheduleJobAddEditDetailComponent,
        data: {
          breadcrumb: 'menu.cms.mdm.config-schedule-job.edit',
          actionType: ActionTypeEnum._EDIT,
        },
        resolve: { me: AuthoritiesResolverService },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MdmRoutingModule {
}
