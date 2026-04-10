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
  ColumnModel, FlatTreeNodeModel,
  IconTypeEnum, NumericInputFormat,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FORM_CONFIG } from 'src/app/modules/mdm/inventment-limit/investment-limit-search/investment-limit-search.config';
import { firstValueFrom, lastValueFrom, map, Observable } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { environment } from 'src/environments/environment';
import {  InvestmentLimitModel } from 'src/app/modules/mdm/_models/investment-limit.model';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-investment-limit-search',
  standalone: false,
  templateUrl: './investment-limit-search.component.html',
})
export class InvestmentLimitSearchComponent {
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch?: FormGroup;
  public formatFun: NumericInputFormat = new NumericInputFormat();
  protected readonly environment = environment;

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  currencyValues: SelectModel[] = []

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

    this.columns.push(
      {
        columnDef: 'code', header: 'code',
        title: (e:  InvestmentLimitModel) => `${e.code || ''}`,
        cell: (e:  InvestmentLimitModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name', header: 'name',
        title: (e:  InvestmentLimitModel) => `${e.name || ''}`,
        cell: (e:  InvestmentLimitModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'limitAmount', header: 'limitAmount',
        title: (e:  InvestmentLimitModel) => `${e.limitAmount || ''}`,
        cell: (e:  InvestmentLimitModel) => `${ new NumericInputFormat().formatValue(e.limitAmount) || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'currencyId', header: 'currency',
        title: (e:  InvestmentLimitModel) => `${e.currencyName || ''}`,
        cell: (e:  InvestmentLimitModel) => `${e.currencyName || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e:  InvestmentLimitModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e:  InvestmentLimitModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: (e:  InvestmentLimitModel) => true,
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
        display: (e:  InvestmentLimitModel) => true,
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
        display: (e:  InvestmentLimitModel) => true,
        disabled: (e:  InvestmentLimitModel) => e?.status === 'APPROVED',
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
        display: (e:  InvestmentLimitModel) => true,
        disabled: (e:  InvestmentLimitModel) => e?.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
    this.statusValues$ = this.selectValuesService.getStatus();
  }

  async ngOnInit() {
    this.currencyValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/currency`));
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }
}
