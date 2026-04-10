import {Component, OnInit} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, BaseStatusEnum,
  DateUtilService, NumericInputFormat,
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
import {
  DEFAULT_REGEX, NUMBER_DEFAULT,
  VIETNAMESE_REGEX,
} from 'src/app/shared/constants/regex.constants';
import { firstValueFrom, lastValueFrom, Observable, of } from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from 'src/app/modules/mdm/tax/tax-search/tax-search.config';
import {  InvestmentLimitModel } from 'src/app/modules/mdm/_models/investment-limit.model';

@Component({
  selector: 'app-investment-limit-add-edit-detail',
  standalone: false,
  templateUrl: './investment-limit-add-edit-detail.component.html',
})
export class InvestmentLimitAddEditDetailComponent extends BaseAddEditComponent implements OnInit {

  moduleName = 'mdm.investment-limit';
  configForm: Config;
  model:  InvestmentLimitModel | null = null;
  isView = false;

  statusValues$: Observable<SelectModel[]>

  checkIsActive!: boolean;
  public formatFun: NumericInputFormat = new NumericInputFormat();

  protected readonly environment = environment;
  currencyValues: SelectModel[] = [];

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
      limitAmount: ['', [Validators.maxLength(255), Validators.pattern(NUMBER_DEFAULT)]],
      description: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      currencyId: [],
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
    this.currencyValues = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/currency`,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        true
      ),
    );
    if(!this.isEdit) {
      this.currencyValues = this.currencyValues.filter((item: any) => item.rawData?.status === 'APPROVED');
    }

    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get< InvestmentLimitModel>(`${environment.PATH_API_V1}/mdm/investment-limit/` + this.id, new HttpParams())
      );

      this.checkIsActive = this.model?.status === 'APPROVED';
      this.addEditForm.patchValue(this.model);
    }
    this.currencyValues = this.currencyValues.filter((item: any) => item.rawData.status === 'APPROVED' ||
      (item.value === this.model?.currencyId));

    if (this.isView) {
      this.patchValueForm()
    }
  }

  patchValueForm() {
    const limitAmount = this.model?.limitAmount != null ? `${Number(this.model.limitAmount).toLocaleString()}` : '';
    this.addEditForm.get('limitAmount')?.setValue(limitAmount);
    this.addEditForm.get('status')?.setValue(this.translateService.instant(
      this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || '')));
    this.addEditForm.get('createdDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.createdDate)));
    this.addEditForm.get('lastModifiedDate')?.setValue(this.dateUtilService.convertDateToDisplayGMT0(String(this.model?.lastModifiedDate)));
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/investment-limit/${this.id}/${status}`, '');
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm', // Nút Xác nhận
      'common.button.back' // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/investment-limit/edit`, item]).then();
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
    const payload = new  InvestmentLimitModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/investment-limit/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/investment-limit`, formData);

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
