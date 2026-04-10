import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs/dist/types';
import {Config} from 'src/app/common/models/config.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {Utils} from 'src/app/shared/utils/utils';
import {FORM_CONFIG} from './currency.config';
import {CurrencyModel} from '../../_models/currency.model';
import {EmployeeModel} from "src/app/shared/components/internal-user/internal-user.model";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-currency-search',
  standalone: false,
  templateUrl: './currency-search.component.html'
})
export class CurrencySearchComponent {
    Utils = Utils;
    configForm: Config;
    formAdvanceSearch?: FormGroup;

    columns: ColumnModel[] = [];
    buttons: ButtonModel[] = [];

    statusValues$: Observable<SelectModel[]>;

    protected readonly environment = environment;

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

      this.formAdvanceSearch = formBuilder.group(
        this.configForm.filterForm!.reduce((result: any, item) => {
          result[item.name] = item.validate;
          return result;
        }, {}),
      );

      this.columns.push(
        {
          columnDef: 'code',
          header: 'code',
          className: 'mat-column-code',
          title: (e: CurrencyModel) => `${e.code || ''}`,
          cell: (e: CurrencyModel) => `${e.code || ''}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        {
          columnDef: 'name',
          header: 'name',
          className: 'mat-column-name',
          title: (e: CurrencyModel) => `${e.name || ''}`,
          cell: (e: CurrencyModel) => `${e.name || ''}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        {
          columnDef: 'status',
          header: 'status',
          className: 'mat-column-status',
          title: (e: CurrencyModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
          cell: (e: CurrencyModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
          display: (e: CurrencyModel) => true, //!this.isPopup,
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
          display: (e: CurrencyModel) => true, //!this.isPopup,
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
          display: (e: CurrencyModel) => true, //!this.isPopup,
          disabled: (e: EmployeeModel) => e?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._APPROVED]),
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
          display: (e: CurrencyModel) => true,
          disabled: (e: EmployeeModel) => e?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._REJECTED]),
          header: 'common.table.action.title',
          alignHeader: AlignEnum.CENTER,
        },
      );

      this.statusValues$ = this.selectValuesService.getStatus();
    }

    get hasAddPermission() {
      return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
    }
}
