import {HttpParams} from '@angular/common/http';
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {Config} from 'src/app/common/models/config.model';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {CloudSearchComponent} from 'src/app/shared/components/base-search/cloud-search.component';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {Utils} from 'src/app/shared/utils/utils';
import {environment} from 'src/environments/environment';
import {FORM_CONFIG} from './project-evaluation-search.config';

import {ProjectEvaluationModel, ProjectEvaluationStatusEnum} from '../../models/project-evaluation.model';
import {EnumUtil} from "src/app/shared/utils/enum.util";
import { debounceTime, distinctUntilChanged, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-evaluation-search',
  templateUrl: './project-evaluation-search.component.html',
  styleUrl: './project-evaluation-search.component.scss',
  standalone: false,
})
export class ProjectEvaluationSearchComponent implements AfterViewInit, OnInit {
  @ViewChild('cloudSearchRef') cloudSearchComponent!: CloudSearchComponent;
  configForm: Config;
  formAdvanceSearch: FormGroup;
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  statusValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  protected readonly Utils = Utils;
  protected readonly environment = environment;

  constructor(
    protected formBuilder: FormBuilder,
    protected selectValuesService: SelectValuesService,
    protected utilsService: UtilsService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected apiService: ApiService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
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
        columnDef: 'projectCode',
        header: 'projectCode',
        title: (e: ProjectEvaluationModel) => `${e.projectCode || ''}`,
        cell: (e: ProjectEvaluationModel) => `${e.projectCode || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'projectName',
        header: 'projectName',
        title: (e: ProjectEvaluationModel) => `${e.projectName || ''}`,
        cell: (e: ProjectEvaluationModel) => `${e.projectName || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'reportName',
        header: 'reportName',
        title: (e: ProjectEvaluationModel) => `${e.reportName || ''}`,
        cell: (e: ProjectEvaluationModel) => `${e.reportName || ''}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'evaluationStartDate',
        header: 'evaluationStartDate',
        title: (e: ProjectEvaluationModel) =>
          `${this.dateUtilService.convertDateToDisplayServerTime(e.evaluationStartDate!)}`,
        cell: (e: ProjectEvaluationModel) =>
          `${this.dateUtilService.convertDateToDisplayServerTime(e.evaluationStartDate!)}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'evaluationEndDate',
        header: 'evaluationEndDate',
        title: (e: ProjectEvaluationModel) =>
          `${this.dateUtilService.convertDateToDisplayServerTime(e.evaluationEndDate!)}`,
        cell: (e: ProjectEvaluationModel) =>
          `${this.dateUtilService.convertDateToDisplayServerTime(e.evaluationEndDate!)}`,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'projectEvalStatus',
        header: 'status',
        title: (e: ProjectEvaluationModel) => `${
          e.projectEvalStatus
            ? this.utilsService.getEnumValueTranslated(ProjectEvaluationStatusEnum, e.projectEvalStatus)
            : ''
        }`,
        cell: (e: ProjectEvaluationModel) => `${
          e.projectEvalStatus
            ? this.utilsService.getEnumValueTranslated(ProjectEvaluationStatusEnum, e.projectEvalStatus)
            : ''
        }`,
        align: AlignEnum.CENTER,
      }
    );

    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary',
        title: 'common.title.detail',
        display: (e: ProjectEvaluationModel) => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'addOrEdit',
        className: 'primary',
        title: 'common.title.edit',
        display: (e: ProjectEvaluationModel) => true,
        disabled: (e: ProjectEvaluationModel) =>
          !(
            e.projectEvalStatus == 'WAITING' ||
            e.projectEvalStatus == 'REJECTED' ||
            e.projectEvalStatus == 'REVOKED'
          ),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'delete',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'delete',
        className: 'primary mat-column-detail',
        title: 'project.project-evaluation.action.delete',
        display: (e: ProjectEvaluationModel) => this.hasRejectPermission,
        disabled: (e: ProjectEvaluationModel) => e.projectEvalStatus != 'WAITING',
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'cancel',
        color: 'primary',
        icon: 'fa fa-times',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'cancel',
        className: 'primary mat-column-detail',
        title: 'project.project-evaluation.action.cancel',
        display: (e: ProjectEvaluationModel) => this.hasCancelPermission,
        disabled: (e: ProjectEvaluationModel) =>
          !(e.projectEvalStatus == 'REJECTED' || e.projectEvalStatus == 'REVOKED'),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
    EnumUtil.enum2SelectModel(ProjectEvaluationStatusEnum, this.statusValues, 'EDIT');

    this.formAdvanceSearch
      .get('projectId')
      ?.valueChanges.pipe(debounceTime(0), distinctUntilChanged())
      .subscribe((res) => {
        if (res == -1) {
          this.formAdvanceSearch.get('projectId')?.setValue('');
        }
      });
  }

  async ngOnInit() {
    this.projectValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/project/project`),
    );
  }

  ngAfterViewInit(): void {
    this.cloudSearchComponent.table.clickAction.subscribe((event: ButtonClickEvent) => {
      switch (event.action) {
        case 'delete':
          this.onAction('reject', event.object);
          break;
        case 'cancel':
          this.onAction('cancel', event.object);
          break;
      }
    });
  }

  onAction(action: string, row: ProjectEvaluationModel) {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/project-evaluation/${row.id}/${action}`, {});
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.cloudSearchComponent.onSubmit();
      },
      `project.project-evaluation.${action}.success`,
      'common.title.confirm',
      undefined,
      `project.project-evaluation.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  convertField2HttpParamFn = (params: HttpParams, formGroup: FormGroup) => {
    params = params.set('status', 'APPROVED');

    const evaluationStartDate = formGroup.get('evaluationStartDate')?.value;
    const evaluationEndDate = formGroup.get('evaluationEndDate')?.value;

    if (evaluationStartDate) {
      const formattedStartDate = this.formatDateToServer(evaluationStartDate);
      params = params.set('evaluationStartDate', formattedStartDate);
    }
    if (evaluationEndDate) {
      const formattedEndDate = this.formatDateToServer(evaluationEndDate);
      params = params.set('evaluationEndDate', formattedEndDate);
    }

    return params;
  };

  formatDateToServer(dateValue: string): string {
    if (!dateValue) return '';
    const datePart = dateValue.split(' ')[0];

    if (datePart.includes('-')) {
      const parts = datePart.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} 00:00:00`;
      }
    }
    return dateValue;
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? '',
    );
  }

  get hasCancelPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(`POST${environment.PATH_API_V1}/project/project-evaluation/{id}/cancel`)
    );
  }
}
