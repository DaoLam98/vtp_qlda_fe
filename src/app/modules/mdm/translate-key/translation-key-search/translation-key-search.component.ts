import {Component, OnInit} from '@angular/core';
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
import {lastValueFrom, map, Observable} from 'rxjs';
import {Config} from 'src/app/common/models/config.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {NotificationTemplateModel} from 'src/app/modules/mdm/_models/notification-template.model';
import {TranslationKeyModel} from 'src/app/modules/mdm/_models/translation-key.model';
import {Utils} from 'src/app/shared/utils/utils';
import {environment} from 'src/environments/environment';
import {FORM_CONFIG} from './translation-key-search.config';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";

@Component({
  selector: 'app-translation-key-search',
  templateUrl: './translation-key-search.component.html',
  standalone: false,
})
export class TranslationKeySearchComponent implements OnInit {
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;
  moduleValues: SelectModel[] = [];

  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectService: SelectValuesService,
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
        columnDef: 'key',
        header: 'key',
        title: (e: TranslationKeyModel) => `${e.key || ''}`,
        cell: (e: TranslationKeyModel) => `${e.key || ''}`,
        className: 'mat-column-key',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'module',
        header: 'module',
        title: (e: TranslationKeyModel) => `${this.moduleValues.find((item) => item.value == e.module)?.displayValue || ''}`,
        cell: (e: TranslationKeyModel) => `${this.moduleValues.find((item) => item.value == e.module)?.displayValue  || ''}`,
        className: 'mat-column-module',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: TranslationKeyModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: TranslationKeyModel) =>
          `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
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
  }

  async ngOnInit() {
    this.moduleValues = await lastValueFrom(
      this.selectService
        .getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/module`)
        .pipe(
          map((values) => values.map(
            (value) => new SelectModel(
              value.rawData.code || value.value, value.rawData.name || value.displayValue,
              false, value
            ))),
        ),
    );
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
