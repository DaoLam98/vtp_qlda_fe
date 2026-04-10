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
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {UnitOfMeasureModel} from 'src/app/core';
import {EnumUtil} from 'src/app/shared/utils/enum.util';
import {firstValueFrom, Observable, of} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/unit/unit-search/unit-search.config";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-unit-add-edit-detail',
  standalone: false,
  templateUrl: './unit-add-edit-detail.component.html'
})
export class UnitAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.unit-of-measure';
  configForm: Config;
  model: UnitOfMeasureModel | null = null;
  isView: boolean = false;
  checkIsActive!: boolean;
  statusValues$: Observable<SelectModel[]>

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
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      status: [],
      statusDisplay: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.statusValues$ = of(this.selectService.statusValues);
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<UnitOfMeasureModel>(
          `${environment.PATH_API_V1}/mdm/unit-of-measure/` + this.id, new HttpParams())
      );

      this.addEditForm.setValue(
        UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model)
      );

      this.checkIsActive =
        this.model?.status === EnumUtil.getKeysByValues(BaseStatusEnum, [BaseStatusEnum._APPROVED]);
    }

    if(this.isView) {
      this.addEditForm.patchValue({
        statusDisplay: this.model?.status
          ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status)
          : '',
        createdDate: this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)),
        lastModifiedDate: this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)),
      });
    }
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/unit-of-measure/${this.id}/${status}`, '');

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
    this.router.navigate([`/mdm/unit-of-measure/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new UnitOfMeasureModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/unit-of-measure/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/unit-of-measure`, formData);

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
