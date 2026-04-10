import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, BaseStatusEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {ScheduleModel} from 'src/app/modules/mdm/_models/schedule-job.model';
import {firstValueFrom, Observable, of} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from 'src/app/modules/mdm/schedule-job/schedule-job-search/schedule-job-search.config';

@Component({
  selector: 'app-menu-add-edit-detail',
  standalone: false,
  templateUrl: './schedule-job-add-edit-detail.component.html',
})
export class ScheduleJobAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName = 'mdm.config-schedule-job';
  configForm: Config;
  model: ScheduleModel | null = null;
  isView = false;

  moduleValues: any[] = [];
  statusValues$: Observable<SelectModel[]>
  checkIsActive!: boolean;

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
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      cron: [],
      maximumLock: [],
      isOneTime: [],
      keyword: [],
      service: [],
      status: [],
      createdBy: [],
      createdDate: [],
      lastModifiedBy: [],
      lastModifiedDate: [],
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }


  async ngOnInit() {
    super.ngOnInit();
    this.onGetParent();

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<ScheduleModel>(`${environment.PATH_API_V1}/mdm/config-schedule-job/` + this.id, new HttpParams())
      );
      this.checkIsActive = this.model?.status === 'APPROVED';
      this.addEditForm.patchValue(this.model);
    }

    if (this.isView) {
      this.addEditForm.get('name')?.disable();
      this.addEditForm.get('cron')?.disable();
      this.addEditForm.get('isOneTime')?.disable();
      this.addEditForm.get('maximumLock')?.disable();
      this.addEditForm.get('status')?.setValue(this.translateService.instant(
        this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
      this.addEditForm.get('createdDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
      this.addEditForm.get('lastModifiedDate')?.setValue(
        this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)));
    }
  }

  onGetParent() {
    this.selectService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/module`,
      undefined,
      undefined,
      undefined,
      true,
    ).subscribe(res => {
      this.moduleValues = res;
    })
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/config-schedule-job/${this.id}/${status}`, '');
    this.utilsService.execute(apiCall, this.onSuccessFunc,
      `common.${status}.success`,
      `common.confirm.${status}`, ['menu.']);
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/schedule-job/edit`, item]).then();
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ScheduleModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/config-schedule-job/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/config-schedule-job`, formData);

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm', // Nút Xác nhận
      'common.button.back' // Nút Quay lại
    );
  }
}
