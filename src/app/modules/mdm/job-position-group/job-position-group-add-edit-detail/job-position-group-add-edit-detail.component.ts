import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {catchError, EMPTY} from 'rxjs';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {environment} from "src/environments/environment";
import {JobPositionGroupDetailModel} from "src/app/modules/mdm/_models/job-position-group.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {
  FORM_CONFIG
} from "src/app/modules/mdm/job-position-group/job-position-group-search/job-position-group-search.config";

@Component({
  selector: 'app-job-position-group-add-edit-detail',
  standalone: false,
  templateUrl: './job-position-group-add-edit-detail.component.html',
})
export class JobPositionGroupAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.job-position-group';
  configForm: Config;
  detailData: JobPositionGroupDetailModel | null = null;
  checkIsActive!: boolean;
  actionType: ActionTypeEnum = ActionTypeEnum._ADD;

  typeValues: SelectModel[] = [
    {
      displayValue: `${this.moduleName}.form.type.option.leader`,
      value: 'LEADER',
      rawData: 'LEADER',
      disabled: false
    },
    {
      displayValue: `${this.moduleName}.form.type.option.staff`,
      value: 'STAFF',
      rawData: 'STAFF',
      disabled: false
    },
  ];

  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

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
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      type: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
    });

    this.actionType = this.activatedRoute.routeConfig?.data?.actionType
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;
  }

  ngOnInit() {
    super.ngOnInit();

    this.isEdit && this.callAPIGetDetail();
  }

  callAPIGetDetail() {
    this.apiService.get<JobPositionGroupDetailModel>(
      `${environment.PATH_API_V1}/mdm/job-position-group/` + this.id, new HttpParams())
      .pipe(catchError(error => {
        return EMPTY
      }))
      .subscribe(res => {
        this.detailData = {...res};
        this.checkIsActive = this.detailData?.status === 'APPROVED';

        this.initForm(this.detailData)
      })
  }

  initForm(detailData: JobPositionGroupDetailModel) {
    const statusValue = this.isView ?
      this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, detailData.status || ''))
      : detailData.status;

    const formValue = {
      code: detailData.code,
      name: detailData.name,
      description: detailData.description,
      type: detailData.type,
      status: statusValue,
      createdBy: detailData.createdBy,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(detailData?.createdDate ?? ''),
      lastModifiedBy: detailData.lastModifiedBy,
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(detailData?.lastModifiedDate ?? ''),
    }

    this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, formValue));
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/job-position-group/${this.id}/${status}`, '');

    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      `common.title.confirm`,
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/job-position-group/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new JobPositionGroupDetailModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/job-position-group/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/job-position-group`, formData);

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
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }
}
