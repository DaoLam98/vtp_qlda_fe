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
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {MenuModel} from 'src/app/core';
import {firstValueFrom, Observable, of} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/menu/menu-search/menu-search.config";

@Component({
  selector: 'app-menu-add-edit-detail',
  standalone: false,
  templateUrl: './menu-add-edit-detail.component.html',
})
export class MenuAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName: string = 'mdm.menu';
  configForm: Config;
  model: MenuModel | null = null;
  isView: boolean = false;

  moduleValues: any[] = [];
  statusValues$: Observable<SelectModel[]>

  typeValues = [
    {
      value: 'MOBILE',
      displayValue: 'Mobile',
      rawData: 'MOBILE',
    },
    {
      displayValue: 'Web',
      value: 'WEB',
      rawData: 'WEB',
    },
    {
      displayValue: 'BPMN',
      value: 'BPMN',
      rawData: 'BPMN',
    },
  ];
  checkIsActive!: boolean;

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
      name: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      code: ['', [Validators.pattern(DEFAULT_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      url: [''],
      useForWebsite: [true],
      useForMobile: [false],
      useForBpmn: [false],
      moduleId: [''],
      status: [],
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

    this.onGetParent();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<MenuModel>(`${environment.PATH_API_V1}/mdm/menu/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
      this.addEditForm.patchValue(this.model);

      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/module`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        false,
      ).subscribe(res => {
        this.moduleValues = res;
      });
    }

    if(this.isView) {
      this.addEditForm.get('useForMobile')?.disable();
      this.addEditForm.get('useForBpmn')?.disable();
      this.addEditForm.get('useForWebsite')?.disable();
      this.addEditForm.get('status')?.setValue(this.translateService.instant(
        this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
      this.addEditForm.get('createdDate')?.setValue(
        this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
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
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/menu/${this.id}/${status}`, '');

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
    this.router.navigate([`/mdm/menu/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new MenuModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/menu/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/menu`, formData);

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
