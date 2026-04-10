import { Component, OnInit } from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, BaseStatusEnum, ButtonClickEvent, ButtonModel, ColumnModel, ColumnTypeEnum,
  DateUtilService, IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { ActionTypeEnum } from 'src/app/shared';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DEFAULT_REGEX, VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { firstValueFrom, Observable, of } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Config } from 'src/app/common/models/config.model';
import { FORM_CONFIG } from 'src/app/modules/mdm/target-group/target-group-search/target-group-search.config';
import { PeriodTypeModel } from 'src/app/modules/mdm/_models/period-type.model';
import { PeriodValueModel } from 'src/app/modules/mdm/_models/period-value.model';

@Component({
  selector: 'app-period-type-add-edit-detail',
  standalone: false,
  templateUrl: './period-type-add-edit-detail.component.html',
})
export class PeriodTypeAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName = 'mdm.period-type';
  configForm: Config;
  model: PeriodTypeModel | null = null;
  isView = false;

  statusValues$: Observable<SelectModel[]>;
  checkIsActive!: boolean;

  periodValueColumns: ColumnModel[] = [];
  periodValueButtons: ButtonModel[] = [];
  protected readonly environment = environment;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      periodValues: [[]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.periodValueColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        className: 'mat-column-stt',
        title: (e: PeriodValueModel) => {
          const values = this.addEditForm.get('periodValues')?.value as PeriodValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: PeriodValueModel) => {
          const values = this.addEditForm.get('periodValues')?.value as PeriodValueModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: PeriodValueModel) => `${e.name}`,
        cell: (e: PeriodValueModel) => `${e.name}`,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        isRequired: !this.isView,
        onCellValueChange: (e: PeriodValueModel) => {
        },
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'dataType',
        header: 'data-type',
        className: 'mat-column-data-type',
        title: (e: PeriodValueModel) => `${e.dataType}`,
        cell: (e: PeriodValueModel) => `${e.dataType}`,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT,
        isRequired: !this.isView,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.periodValueButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeletePeriodValue',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: PeriodValueModel) => !this.isView,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }


  async ngOnInit() {
    super.ngOnInit();

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<PeriodTypeModel>(`${environment.PATH_API_V1}/mdm/period-type/` + this.id, new HttpParams()),
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
      this.addEditForm.patchValue(this.model);
    }

    if (this.isView) {
      this.addEditForm.get('status')?.setValue(this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
      this.addEditForm.get('createdDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
      this.addEditForm.get('lastModifiedDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)));
    } else {
      const values = this.addEditForm.get('periodValues')?.value;
      if (Array.isArray(values) && values.length === 0) {
        this.addPeriodValue();
      }
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/period-type/${this.id}/${status}`, '');
    this.utilsService.execute(apiCall, this.onSuccessFunc,
      `common.${status}.success`,
      `common.confirm.${status}`, ['menu.']);
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/period-type/edit`, item]).then();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '');
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new PeriodTypeModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/period-type/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/period-type`, formData);

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(apiCall, this.onSuccessFunc,
      `common.${action}.success`,
      `common.confirm.${action}`, ['menu.']);
  }

  onPeriodValuesTableAction(event: ButtonClickEvent) {
    if (event.action === 'onDeletePeriodValue') this.onDeletePeriodValue(event.index);
  }

  onDeletePeriodValue(index: number | null | undefined) {
    const periodValues = this.addEditForm.get('periodValues')?.value;
    if (periodValues.length === 1) {
      return;
    }
    periodValues.splice(index, 1);
    this.addEditForm.get('periodValues')?.setValue(periodValues);
  }

  addPeriodValue() {
    const values = this.addEditForm.get('periodValues')?.value as PeriodValueModel[];
    this.addEditForm.get('periodValues')?.patchValue([
      ...values,
      {
        name: null,
        dataType: '',
        periodId: this.model?.id,
      },
    ]);
  }
}
