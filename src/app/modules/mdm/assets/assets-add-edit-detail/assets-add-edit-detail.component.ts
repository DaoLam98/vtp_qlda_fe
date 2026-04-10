import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {Config} from "src/app/common/models/config.model";
import {AssetsModel} from "src/app/modules/mdm/_models/assets.model";
import {environment} from 'src/environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {FORM_CONFIG} from "src/app/modules/mdm/assets/assets-search/assets-search.config";
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {ActionTypeEnum} from "src/app/shared";
import {firstValueFrom, lastValueFrom} from "rxjs";
import {HttpParams} from "@angular/common/http";

@Component({
  selector: 'app-assets-add-edit-detail',
  standalone: false,
  templateUrl: './assets-add-edit-detail.component.html'
})
export class AssetsAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.asset';
  configForm: Config;
  model: AssetsModel | null = null;
  isView: boolean = false;
  checkIsActive!: boolean;
  assetGroupValues: SelectModel[] = [];
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
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.pattern(VIETNAMESE_REGEX), Validators.maxLength(255)]],
      assetGroupId: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
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

    this.assetGroupValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/asset-group`,
        undefined,
        undefined,
        undefined,
        true,
      )
    )

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<AssetsModel>(
          `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model?.status === 'APPROVED';

      this.model.status = this.isView
        ? this.translateService.instant(
          this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status || ''))
        : this.model.status;

      this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));


      const assetGroupValueRes = await lastValueFrom(
        this.selectService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/asset-group`,
          [
            { key: 'sortDirection', value: 'asc' },
            { key: 'sortBy', value: 'name' },
          ],
          undefined,
          'id,code,name,description,status',
          true,
          undefined,
          true
        )
      )

      this.assetGroupValues = assetGroupValueRes.filter(item => !item.disabled || item.value === this.model?.assetGroupId);
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
    this.router.navigate([`/mdm/assets/edit`, item]).then();
  }

  onSubmit() {
    const formGroupData = new FormData();
    const payload = new AssetsModel(this.addEditForm);
    formGroupData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, formGroupData)
      : this.apiService.post(`${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}`, formGroupData);

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
