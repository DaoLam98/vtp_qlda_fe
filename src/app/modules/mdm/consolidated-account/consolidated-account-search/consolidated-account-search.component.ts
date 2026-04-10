import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AlignEnum,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { Observable } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { ConsolidatedAccountModel } from '../../_models/consolidated-account.model';
import { FORM_CONFIG } from './consolidated-account-search.config';

@Component({
  selector: 'app-consolidated-account-search',
  templateUrl: './consolidated-account-search.component.html',
  standalone: false,
})
export class ConsolidatedAccountSearchComponent {
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;
  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectService: SelectValuesService,
    protected utilsService: UtilsService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    this.configForm = FORM_CONFIG;

    this.formAdvanceSearch = formBuilder.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = ['', item.validate ?? []];
        return result;
      }, {}),
    );

    this.columns.push(
      {
        columnDef: 'code',
        header: 'code',
        title: (e: ConsolidatedAccountModel) => `${e.code || ''}`,
        cell: (e: ConsolidatedAccountModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: ConsolidatedAccountModel) => `${e.name || ''}`,
        cell: (e: ConsolidatedAccountModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ConsolidatedAccountModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: ConsolidatedAccountModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: (e: ConsolidatedAccountModel) => true,
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
        display: (e: ConsolidatedAccountModel) => true,
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
        display: (e: ConsolidatedAccountModel) => true,
        disabled: (e: ConsolidatedAccountModel) => e.status === 'APPROVED',
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
        display: (e: ConsolidatedAccountModel) => true,
        disabled: (e: ConsolidatedAccountModel) => e.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );

    this.statusValues$ = this.selectService.getStatus();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }
}
