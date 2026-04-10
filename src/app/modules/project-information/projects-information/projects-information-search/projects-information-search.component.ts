import { Component } from '@angular/core';
import {Config} from "src/app/common/models/config.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {
  AlignEnum,
  ApiService,
  AuthoritiesService, BaseStatusEnum,
  ButtonModel,
  ColumnModel, IconTypeEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {Observable, of} from "rxjs";
import {environment} from "src/environments/environment";
import {Utils} from 'src/app/shared/utils/utils';
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {
  FORM_CONFIG
} from "src/app/modules/project-information/projects-information/projects-information-search/projects-information-search.config";
import {ProjectDetailModel} from "src/app/modules/project-information/models/projects-information.model";
import {ProjectStatusEnum} from "src/app/shared/enums/project-archive.enum";

@Component({
  selector: 'app-projects-information-search',
  standalone: false,
  templateUrl: './projects-information-search.component.html'
})
export class ProjectsInformationSearchComponent {
  configForm: Config
  formAdvanceSearch: FormGroup;
  formFieldDisplay: { [p: string]: any } = {};
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = []

  statusValues: SelectModel[] = [
    {
      displayValue: this.translateService.instant('common.project.status.doing'),
      value: 'APPROVED',
      rawData: 'APPROVED',
      disabled: false
    },
    {
      displayValue: this.translateService.instant('common.project.status.closed'),
      value: 'REJECTED',
      rawData: 'REJECTED',
      disabled: false
    }
  ];
  investmentFormValues$: Observable<SelectModel[]>;
  organizationValues$: Observable<SelectModel[]>;

  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        title: (e: ProjectDetailModel) => `${e.code || ''}`,
        cell: (e: ProjectDetailModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'sapCode',
        header: 'sapCode',
        title: (e: ProjectDetailModel) => `${e.sapCode || ''}`,
        cell: (e: ProjectDetailModel) => `${e.sapCode || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: ProjectDetailModel) => `${e.name || ''}`,
        cell: (e: ProjectDetailModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'investmentFormName',
        header: 'investmentFormName',
        title: (e: ProjectDetailModel) => `${e.investmentFormName || ''}`,
        cell: (e: ProjectDetailModel) => `${e.investmentFormName || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'proposingOrgName',
        header: 'proposingOrgName',
        title: (e: ProjectDetailModel) => `${e.proposingOrgName || ''}`,
        cell: (e: ProjectDetailModel) => `${e.proposingOrgName || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ProjectDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(ProjectStatusEnum, e.status) : ''}`,
        cell: (e: ProjectDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(ProjectStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: ProjectDetailModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: ProjectDetailModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );

    this.investmentFormValues$ = this.selectService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/investment-form`,
    );
    this.organizationValues$ = this.selectService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`,
    );

    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
