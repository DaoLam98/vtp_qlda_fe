import {Component} from '@angular/core';
import {Config} from 'src/app/common/models/config.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {FORM_CONFIG} from 'src/app/modules/mdm/schedule-job/schedule-job-search/schedule-job-search.config';
import {Observable} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {environment} from 'src/environments/environment';
import {ScheduleModel} from 'src/app/modules/mdm/_models/schedule-job.model';

@Component({
  selector: 'app-schedule-job-search',
  standalone: false,
  templateUrl: './schedule-job-search.component.html'
})
export class ScheduleJobSearchComponent {
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
      displayValue: this.translateService.instant('common.combobox.option.default'),
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
        columnDef: 'name', header: 'name',
        title: (e: ScheduleModel) => `${e.name || ''}`,
        cell: (e: ScheduleModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'cron', header: 'cron',
        title: (e: ScheduleModel) => `${e.cron || ''}`,
        cell: (e: ScheduleModel) => `${e.cron || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },

      {
        columnDef: 'isOneTime', header: 'isOneTime',
        title: (e: ScheduleModel) => `${e.isOneTime}`,
        cell: (e: ScheduleModel) => `${e.isOneTime}`,
        columnType: (e) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
        disabled: () => true,
        className: 'mat-column-isOneTime',
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
        display: (e: ScheduleModel) => true, // !this.isPopup,
        header: 'common.table.action.title',
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
        display: (e: ScheduleModel) => true, // !this.isPopup,
        header: 'common.table.action.title',
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
        display: (e: ScheduleModel) => true, // !this.isPopup,
        disabled: (e: ScheduleModel) => e?.status === 'APPROVED', // !this.isPopup,
        header: 'common.table.action.title',
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
        display: (e: ScheduleModel) => true, // !this.isPopup,
        disabled: (e: ScheduleModel) => e?.status === 'REJECTED', // !this.isPopup,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER
      },
    );
    this.moduleValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/module`);
    this.statusValues$ = this.selectValuesService.getStatus()
    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }

  protected readonly environment = environment;
}
