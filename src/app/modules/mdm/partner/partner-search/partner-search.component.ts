import {Component} from '@angular/core';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FORM_CONFIG} from 'src/app/modules/mdm/partner/partner-search/partner-search.config';
import {Utils} from 'src/app/shared/utils/utils';
import {PartnerModel} from 'src/app/core';
import {Observable} from 'rxjs/dist/types';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-partner-search',
  standalone: false,
  templateUrl: './partner-search.component.html',
})
export class PartnerSearchComponent {
  Utils = Utils;
  configForm: Config;
  formAdvanceSearch: FormGroup;
  formFieldDisplay: { [p: string]: any } = {};

  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];

  statusValues$: Observable<SelectModel[]>;

  typeValues = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      value: 'BUSINESS',
      displayValue: this.translateService.instant('mdm.partner.business'),
      rawData: 'BUSINESS',
      disabled: false
    },
    {
      displayValue: this.translateService.instant('mdm.partner.individual'),
      value: 'INDIVIDUAL',
      rawData: 'INDIVIDUAL',
      disabled: false
    },
  ];

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
        title: (e: PartnerModel) => `${e.code || ''}`,
        cell: (e: PartnerModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: PartnerModel) => `${e.name || ''}`,
        cell: (e: PartnerModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'type',
        header: 'type',
        title: (e: PartnerModel) => `${e.type === 'INDIVIDUAL' ?
          this.translateService.instant('mdm.partner.individual') : this.translateService.instant('mdm.partner.business')}`,
        cell: (e: PartnerModel) => `${e.type === 'INDIVIDUAL' ?
          this.translateService.instant('mdm.partner.individual') : this.translateService.instant('mdm.partner.business')}`,
        className: 'mat-column-type',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'taxNumber',
        header: 'taxNumber',
        title: (e: PartnerModel) => `${e.taxNumber || ''}`,
        cell: (e: PartnerModel) => `${e.taxNumber || ''}`,
        className: 'mat-column-taxNumber',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'email',
        header: 'email',
        title: (e: PartnerModel) => `${e.email || ''}`,
        cell: (e: PartnerModel) => `${e.email || ''}`,
        className: 'mat-column-email',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: PartnerModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: PartnerModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: (e: PartnerModel) => true,
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
        display: (e: PartnerModel) => true,
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
        display: (e: PartnerModel) => true,
        disabled: (e: PartnerModel) => e?.status === 'APPROVED',
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
        display: (e: PartnerModel) => true,
        disabled: (e: PartnerModel) => e?.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );

    this.statusValues$ = this.selectService.getStatus();

    // Initialize formFieldDisplay with default values
    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
