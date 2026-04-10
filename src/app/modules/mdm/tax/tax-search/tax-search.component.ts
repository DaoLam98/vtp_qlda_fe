import { Component } from '@angular/core';
import { Config } from 'src/app/common/models/config.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Utils } from 'src/app/shared/utils/utils';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum, NumericInputFormat,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FORM_CONFIG } from 'src/app/modules/mdm/tax/tax-search/tax-search.config';
import { Observable } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { environment } from 'src/environments/environment';
import { TaxModel } from 'src/app/modules/mdm/_models/tax.model';

@Component({
  selector: 'app-tax-search',
  standalone: false,
  templateUrl: './tax-search.component.html',
})
export class TaxSearchComponent {
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch?: FormGroup;
  public formatFun: NumericInputFormat = new NumericInputFormat();

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  typeValues: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant('common.combobox.option.default'),
      rawData: -1,
    },
    {
      value: true,
      displayValue: this.translateService.instant('mdm.menu.value.display'),
      rawData: true,
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('mdm.menu.value.notDisplay'),
      value: String(false),
      rawData: String(false),
      disabled: false,
    },
  ];

  statusValues$: Observable<SelectModel[]>;

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
    console.log(this.formAdvanceSearch);

    this.columns.push(
      {
        columnDef: 'code', header: 'code',
        title: (e: TaxModel) => `${e.code || ''}`,
        cell: (e: TaxModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name', header: 'name',
        title: (e: TaxModel) => `${e.name || ''}`,
        cell: (e: TaxModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'taxAmount', header: 'tax-rate',
        title: (e: TaxModel) => `${e.taxAmount + '%' || ''}`,
        cell: (e: TaxModel) => `${ new NumericInputFormat().formatValue(e.taxAmount) + '%' || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: TaxModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: TaxModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
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
        display: (e: TaxModel) => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        display: (e: TaxModel) => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'accept',
        className: 'primary content-cell-align-center',
        title: 'common.title.accept',
        display: (e: TaxModel) => true,
        disabled: (e: TaxModel) => e?.status === 'APPROVED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'reject',
        className: 'primary content-cell-align-center',
        title: 'common.title.reject',
        display: (e: TaxModel) => true,
        disabled: (e: TaxModel) => e?.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
    this.statusValues$ = this.selectValuesService.getStatus();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  protected readonly environment = environment;
}
