import {Component} from '@angular/core';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FORM_CONFIG} from 'src/app/modules/mdm/menu/menu-search/menu-search.config';
import {MenuModel} from 'src/app/core';
import {Observable} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-menu-search',
  standalone: false,
  templateUrl: './menu-search.component.html'
})
export class MenuSearchComponent {
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch?: FormGroup;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  moduleValues$: Observable<SelectModel[]>;

  typeValues: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      value: true,
      displayValue: this.translateService.instant('mdm.menu.value.display'),
      rawData: true,
      disabled: false
    },
    {
      displayValue: this.translateService.instant('mdm.menu.value.notDisplay'),
      value: String(false),
      rawData: String(false),
      disabled: false
    }
  ];

  statusValues$: Observable<SelectModel[]>;
  formFieldDisplay: { [key: string]: boolean } = {};

  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected translateService: TranslateService,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
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
        className: 'mat-column-code',
        title: (e: MenuModel) => `${e.code || ''}`,
        cell: (e: MenuModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: MenuModel) => `${e.name || ''}`,
        cell: (e: MenuModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'moduleId',
        header: 'moduleId',
        className: 'mat-column-moduleId',
        title: (e: MenuModel) => `${e.moduleName || ''}`,
        cell: (e: MenuModel) => `${e.moduleName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },

      {
        columnDef: 'useForWebsite',
        header: 'useForWebsite',
        className: 'mat-column-useForWebsite',
        title: (e: MenuModel) => `${e.useForWebsite}`,
        cell: (e: MenuModel) => `${e.useForWebsite}`,
        columnType: (e: MenuModel) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
        disabled: (e: MenuModel) => true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'useForMobile',
        header: 'useForMobile',
        className: 'mat-column-useForMobile',
        title: (e: MenuModel) => `${e.useForMobile}`,
        cell: (e: MenuModel) => `${e.useForMobile}`,
        columnType: (e: MenuModel) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
        disabled: (e: MenuModel) => true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        className: 'mat-column-status',
        title: (e: MenuModel) => `${e.status ? this.utilsService.getEnumValueTranslated(
          BaseStatusEnum, e.status) : ''}`,
        cell: (e: MenuModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        isExpandOptionColumn: () => false,
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
        display: (e: MenuModel) => true, //!this.isPopup,
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
        display: (e: MenuModel) => true, //!this.isPopup,
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
        display: (e: MenuModel) => true, //!this.isPopup,
        disabled: (e: MenuModel) => e?.status === 'APPROVED', //!this.isPopup,
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
        display: (e: MenuModel) => true, //!this.isPopup,
        disabled: (e: MenuModel) => e?.status === 'REJECTED', //!this.isPopup,
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );

    this.moduleValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/module`);

    this.statusValues$ = this.selectValuesService.getStatus()

    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }
}
