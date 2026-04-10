import {Component, OnInit} from '@angular/core';
import {Config} from "src/app/common/models/config.model";
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  UtilsService
} from "@c10t/nice-component-library";
import {environment} from 'src/environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {ActionTypeEnum} from "src/app/shared";
import {
  FORM_CONFIG
} from "src/app/modules/mdm/progress-evaluation/progress-evaluation-search/progress-evaluation-search.config";
import {firstValueFrom} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {ProgressEvaluationModel} from "src/app/modules/mdm/_models/progress-evaluation.model";

@Component({
  selector: 'app-progress-evaluation-add-edit-detail',
  standalone: false,
  templateUrl: './progress-evaluation-add-edit-detail.component.html'
})
export class ProgressEvaluationAddEditDetailComponent extends BaseAddEditComponent implements OnInit   {
  moduleName: string = 'mdm.progress-evaluation';
  configForm: Config;
  model: ProgressEvaluationModel | null = null;
  isView: boolean = false;
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
    private router: Router,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['',  [Validators.pattern(VIETNAMESE_REGEX), Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      status: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<ProgressEvaluationModel>(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
      this.model.status = this.isView
        ? this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status || ''))
        : this.model.status;

      this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}/${status}`, '');
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/progress-evaluation/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ProgressEvaluationModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}`, formData);

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
}
