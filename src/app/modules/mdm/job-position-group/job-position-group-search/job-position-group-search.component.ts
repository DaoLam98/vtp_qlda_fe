import {Component, Injector} from '@angular/core';
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
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from './job-position-group-search.config';
import {Utils} from 'src/app/shared/utils/utils';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {JobPositionGroupDetailModel} from "src/app/modules/mdm/_models/job-position-group.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {environment} from "src/environments/environment";

@Component({
  selector:'app-job-position-group-search',
  templateUrl: './job-position-group-search.component.html',
  standalone: false
})
export class JobPositionGroupSearchComponent {
  moduleName?: string;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch?: FormGroup;
  statusOptions$ = this.selectService.getStatus();
  Utils = Utils;
  typeValues: SelectModel[] = [
    {
      value: -1,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: -1,
    },
    {
      displayValue: `mdm.job-position-group.form.type.option.leader`,
      value: 'LEADER',
      rawData: 'LEADER',
      disabled: false
    },
    {
      displayValue: `mdm.job-position-group.form.type.option.staff`,
      value: 'STAFF',
      rawData: 'STAFF',
      disabled: false
    },
  ];

  protected readonly environment = environment;

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
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
      this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

      this.moduleName = this.configForm?.name
      this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = item.validate;
        return result;
      }, {}));

      this.columns.push(
        {
          columnDef: 'code',
          header: 'code',
          className: 'mat-column-code',
          title: (e: JobPositionGroupDetailModel) => `${e.code || ''}`,
          cell: (e: JobPositionGroupDetailModel) => `${e.code || ''}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        {
          columnDef: 'name',
          header: 'name',
          title: (e: JobPositionGroupDetailModel) => `${e.name || ''}`,
          cell: (e: JobPositionGroupDetailModel) => `${e.name || ''}`,
          className: 'mat-column-name',
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.LEFT,
        },
        {
          columnDef: 'type',
          header: 'type',
          className: 'mat-column-type',
          title: (e: JobPositionGroupDetailModel) => `${this.translateService.instant(this.typeValues.find(item => item.value === e.type)?.displayValue || '') || ''}`,
          cell: (e: JobPositionGroupDetailModel) => `${this.translateService.instant(this.typeValues.find(item => item.value === e.type)?.displayValue || '') || ''}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
        },
        {
          columnDef: 'status',
          header: 'status',
          className: 'mat-column-status',
          title: (e: JobPositionGroupDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
          cell: (e: JobPositionGroupDetailModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
          alignHeader: AlignEnum.CENTER,
          align: AlignEnum.CENTER,
        });

        this.buttons.push(
          {
            columnDef: 'detail',
            color: 'warn',
            icon: 'fa fa-eye',
            iconType: IconTypeEnum.FONT_AWESOME,
            click: 'viewDetail',
            className: 'primary content-cell-align-center',
            title: 'common.title.detail',
            header: "common.table.action.title",
            alignHeader: AlignEnum.CENTER,
            display: (e: JobPositionGroupDetailModel) => true,
          },
          {
            columnDef: 'edit',
            color: 'warn',
            icon: 'fa fa-pen',
            iconType: IconTypeEnum.FONT_AWESOME,
            click: 'addOrEdit',
            className: 'primary content-cell-align-center',
            title: 'common.title.edit',
            header: "common.table.action.title",
            alignHeader: AlignEnum.CENTER,
            display: (e: JobPositionGroupDetailModel) => true,
          },
          {
            columnDef: 'accept',
            color: 'primary',
            icon: 'fa fa-check',
            iconType: IconTypeEnum.FONT_AWESOME,
            click: 'accept',
            className: 'primary content-cell-align-center',
            title: 'common.title.accept',
            display: (e: JobPositionGroupDetailModel) => true,
            disabled: (e: JobPositionGroupDetailModel) => e?.status === 'APPROVED',
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
            display: (e: JobPositionGroupDetailModel) => true,
            disabled: (e: JobPositionGroupDetailModel) => e?.status === 'REJECTED',
            header: "common.table.action.title",
            alignHeader: AlignEnum.CENTER
          },
        );
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
