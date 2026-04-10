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
import {FORM_CONFIG} from "src/app/modules/mdm/data-type/data-type-search/data-type-search.config";
import {DataTypeModel} from "src/app/modules/mdm/_models/data-type.model";

@Component({
  selector: 'app-data-type-search',
  standalone: false,
  templateUrl: './data-type-search.component.html'
})
export class DataTypeSearchComponent {
  configForm: Config
  formAdvanceSearch: FormGroup;
  formFieldDisplay: { [p: string]: any } = {};
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  statusValues$: Observable<SelectModel[]>;
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
        title: (e: DataTypeModel) => `${e.code || ''}`,
        cell: (e: DataTypeModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: DataTypeModel) => `${e.name || ''}`,
        cell: (e: DataTypeModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: DataTypeModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: DataTypeModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    )

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: DataTypeModel) => true,
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
        display: (e: DataTypeModel) => true,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: DataTypeModel) => true,
        disabled: (e: DataTypeModel) => e.status === 'APPROVED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: DataTypeModel) => true,
        disabled: (e: DataTypeModel) => e.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );
    this.statusValues$ = of(this.selectService.statusValues);

    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
