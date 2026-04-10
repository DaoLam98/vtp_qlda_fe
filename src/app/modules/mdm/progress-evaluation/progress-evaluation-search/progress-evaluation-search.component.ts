import { Component } from '@angular/core';
import {Config} from "src/app/common/models/config.model";
import {FormBuilder, FormGroup} from "@angular/forms";
import {
  AlignEnum,
  ApiService,
  AuthoritiesService, BaseStatusEnum,
  ButtonModel,
  ColumnModel, IconTypeEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {Observable, of} from "rxjs";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {
  FORM_CONFIG
} from "src/app/modules/mdm/progress-evaluation/progress-evaluation-search/progress-evaluation-search.config";
import {environment} from "src/environments/environment";
import {Utils} from 'src/app/shared/utils/utils';
import {ProgressEvaluationModel} from "src/app/modules/mdm/_models/progress-evaluation.model";

@Component({
  selector: 'app-progress-evaluation-search',
  standalone: false,
  templateUrl: './progress-evaluation-search.component.html'
})
export class ProgressEvaluationSearchComponent {
  configForm: Config
  formAdvanceSearch: FormGroup;
  formFieldDisplay: { [p: string]: any } = {};
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues$: Observable<SelectModel[]>;
  protected readonly Utils = Utils;
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
        title: (e: ProgressEvaluationModel) => `${e.code || ''}`,
        cell: (e: ProgressEvaluationModel) => `${e.code || ''}`,
        className: 'mat-column-code',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        title: (e: ProgressEvaluationModel) => `${e.name || ''}`,
        cell: (e: ProgressEvaluationModel) => `${e.name || ''}`,
        className: 'mat-column-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'status',
        header: 'status',
        title: (e: ProgressEvaluationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        cell: (e: ProgressEvaluationModel) => `${e.status ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, e.status) : ''}`,
        className: 'mat-column-status',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    )

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: (e: ProgressEvaluationModel) => true,
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
        display: (e: ProgressEvaluationModel) => true,
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
        display: (e: ProgressEvaluationModel) => true,
        disabled: (e: ProgressEvaluationModel) => e.status === 'APPROVED',
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
        display: (e: ProgressEvaluationModel) => true,
        disabled: (e: ProgressEvaluationModel) => e.status === 'REJECTED',
        header: "common.table.action.title",
        alignHeader: AlignEnum.CENTER
      },
    );
    this.statusValues$ = of(this.selectService.statusValues);

    this.formFieldDisplay = this.columns.reduce((result: any, item) => {
      result[item.columnDef] = true;
      return result;
    }, {});
  }
  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }
}
