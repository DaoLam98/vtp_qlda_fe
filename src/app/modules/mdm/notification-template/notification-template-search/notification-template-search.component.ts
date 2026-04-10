import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {
  AlignEnum,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {Config} from 'src/app/common/models/config.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {
  NotificationTemplateModel,
  NotificationTemplateTypeEnum,
} from 'src/app/modules/mdm/_models/notification-template.model';
import {Utils} from 'src/app/shared/utils/utils';
import {environment} from 'src/environments/environment';
import {FORM_CONFIG} from './notification-template-search.config';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: 'app-notification-template-search',
  templateUrl: './notification-template-search.component.html',
  standalone: false,
})
export class NotificationTemplateSearchComponent {
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;
  menuValues$: Observable<SelectModel[]>;
  typeValues: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      displayValue: this.translateService.instant('mdm.translation-key.table.filter.email'),
      value: NotificationTemplateTypeEnum.EMAIL,
      rawData: NotificationTemplateTypeEnum.EMAIL,
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('mdm.translation-key.table.filter.sms'),
      value: NotificationTemplateTypeEnum.SMS,
      rawData: NotificationTemplateTypeEnum.SMS,
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('mdm.translation-key.table.filter.notification'),
      value: NotificationTemplateTypeEnum.NOTIFICATION,
      rawData: NotificationTemplateTypeEnum.NOTIFICATION,
      disabled: false,
    },
  ];

  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectService: SelectValuesService,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
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
        title: (e: NotificationTemplateModel) => `${e.code || ''}`,
        cell: (e: NotificationTemplateModel) => `${e.code || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: NotificationTemplateModel) => `${e.name || ''}`,
        cell: (e: NotificationTemplateModel) => `${e.name || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'content',
        header: 'content',
        className: 'mat-column-content',
        title: (e: NotificationTemplateModel) => `${e.content || ''}`,
        cell: (e: NotificationTemplateModel) => `${e.content || ''}`,
        // isExpandOptionColumn: () => true,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'menuId',
        header: 'menu',
        className: 'mat-column-menu',
        title: (e: NotificationTemplateModel) => `${e.menuName || ''}`,
        cell: (e: NotificationTemplateModel) => `${e.menuName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'type',
        header: 'type',
        className: 'mat-column-type',
        title: (e: NotificationTemplateModel) =>
          `${this.typeValues.find((item) => item.value == e.type)?.displayValue || ''}`,
        cell: (e: NotificationTemplateModel) =>
          `${this.typeValues.find((item) => item.value == e.type)?.displayValue || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        className: 'mat-column-status',
        title: (e: NotificationTemplateModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: NotificationTemplateModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
        display: (e: NotificationTemplateModel) => true,
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
        display: (e: NotificationTemplateModel) => true,
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
        display: (e: NotificationTemplateModel) => true,
        disabled: (e: NotificationTemplateModel) => e.status === 'APPROVED',
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
        display: (e: NotificationTemplateModel) => true,
        disabled: (e: NotificationTemplateModel) => e.status === 'REJECTED',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );

    this.statusValues$ = this.selectService.getStatus();
    this.menuValues$ = this.selectService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/menu`);
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
