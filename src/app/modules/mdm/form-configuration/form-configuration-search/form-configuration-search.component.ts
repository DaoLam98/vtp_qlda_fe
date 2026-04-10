import {Component, Inject, Injector, Optional, QueryList, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from './form-configuration.config';
import {EmployeeModel} from 'src/app/shared/components/internal-user/internal-user.model';
import {Utils} from 'src/app/shared/utils/utils';
import {lastValueFrom, Observable} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {DatePipe} from '@angular/common';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {environment} from 'src/environments/environment';
import {
  FormConfigurationModel
} from 'src/app/modules/mdm/_models/form-configuration.model';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';

@Component({
  selector: 'form-configuration-search',
  standalone: false,
  templateUrl: './form-configuration-search.component.html',
})
export class FormConfigurationSearchComponent {
  @ViewChildren('cloudSearchRef') cloudSearchRefs!: QueryList<CloudSearchComponent>;
  moduleName = '';
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  statusValues$: Observable<SelectModel[]> = this.selectValuesService.getStatus();
  statusOptions$: Observable<SelectModel[]> = this.selectService.getStatus();

  expressionTypeOptions: SelectModel[] = [];
  informationTypeOptions: SelectModel[] = [];

  trackBy = '';

  Utils = Utils;
  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected selectService: SelectValuesService,
    protected datePipe: DatePipe,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() public matDialogRef: MatDialogRef<EmployeeModel>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.moduleName = this.configForm.name || '';

    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: FormConfigurationModel) => `${e.code || ''}`,
        cell: (e: FormConfigurationModel) => `${e.code || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: FormConfigurationModel) => `${e.name || ''}`,
        cell: (e: FormConfigurationModel) => `${e.name || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'expressionTypeId',
        header: 'expressionTypeId',
        className: 'mat-column-expressionTypeId',
        title: (e: FormConfigurationModel) => `${e.expressionTypeName || ''}`,
        cell: (e: FormConfigurationModel) => `${e.expressionTypeName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'informationTypeId',
        header: 'informationTypeId',
        className: 'mat-column-informationTypeId',
        title: (e: FormConfigurationModel) => `${e.informationTypeName || ''}`,
        cell: (e: FormConfigurationModel) => `${e.informationTypeName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'status',
        header: 'status',
        className: 'mat-column-status',
        title: (e: FormConfigurationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(
          BaseStatusEnum, e.status) : ''}`,
        cell: (e: FormConfigurationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(
          BaseStatusEnum, e.status) : ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      }
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
        display: () => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => true,
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => true,
        disabled: (e: FormConfigurationModel) => e?.status === 'APPROVED',
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => true,
        disabled: (e: FormConfigurationModel) => e?.status === 'REJECTED',
        alignHeader: AlignEnum.CENTER
      },
    );
  }

  async ngOnInit() {
    const expressionTypeRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/expression-type`,
      [
        { key: 'sortDirection', value: 'asc,asc' },
        { key: 'sortBy', value: 'status,name' },
      ],
      undefined,
      undefined,
      true,
      undefined,
      true
    ));
    this.expressionTypeOptions = expressionTypeRes.map(option => ({
      ...option,
      disabled: false
    }));
    const informationTypeRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/information-type`,
      [
        { key: 'sortDirection', value: 'asc,asc' },
        { key: 'sortBy', value: 'status,name' },
      ],
      undefined,
      undefined,
      true,
      undefined,
      true
    ));
    this.informationTypeOptions = informationTypeRes.map(option => ({
      ...option,
      disabled: false
    }));
  }
}
