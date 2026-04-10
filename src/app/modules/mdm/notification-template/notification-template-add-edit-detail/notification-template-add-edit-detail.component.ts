import {Location} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
  ActionTypeEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {NotificationTemplateModel, NotificationTemplateTypeEnum} from 'src/app/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {environment} from 'src/environments/environment';
import {DEFAULT_REGEX, VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {
  FORM_CONFIG
} from "src/app/modules/mdm/notification-template/notification-template-search/notification-template-search.config";

@Component({
  selector: 'app-notification-template-add-edit-detail',
  templateUrl: './notification-template-add-edit-detail.component.html',
  styleUrls: ['./notification-template-add-edit-detail.scss'],
  standalone: false,
})
export class NotificationTemplateAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.notification-template';
  configForm: Config;
  model!: NotificationTemplateModel;
  isView: boolean = false;
  checkIsActive!: boolean;
  typeValues: SelectModel[] = [];
  menuValues: SelectModel[] = [];

  protected readonly NotificationTemplateTypeEnum = NotificationTemplateTypeEnum;
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
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
    this.addEditForm = this.fb.group({
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      content: ['', [Validators.maxLength(2000)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      type: [''],
      menuId: [''],
      status: [],
      statusDisplay: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
    });

    this.typeValues.push(
      {
        displayValue: 'mdm.translation-key.table.filter.email',
        value: NotificationTemplateTypeEnum.EMAIL,
        rawData: NotificationTemplateTypeEnum.EMAIL,
        disabled: false,
      },
      {
        displayValue: 'mdm.translation-key.table.filter.sms',
        value: NotificationTemplateTypeEnum.SMS,
        rawData: NotificationTemplateTypeEnum.SMS,
        disabled: false,
      },
      {
        displayValue: 'mdm.translation-key.table.filter.notification',
        value: NotificationTemplateTypeEnum.NOTIFICATION,
        rawData: NotificationTemplateTypeEnum.NOTIFICATION,
        disabled: false,
      },
    );
  }

  async ngOnInit() {
    super.ngOnInit();

    this.menuValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/menu`,undefined, undefined, undefined, true),
    );

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<NotificationTemplateModel>(
          `${environment.PATH_API_V1}/mdm/notification-template/` + this.id, new HttpParams())
      );

      this.model.createdDate = this.dateUtilService.convertDateToDisplayServerTime(this.model.createdDate || '') || '';
      this.model.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
        this.model.lastModifiedDate || '') || '';
      this.checkIsActive = this.model?.status === 'APPROVED';

      this.addEditForm.setValue({
        ...UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model),
        statusDisplay: this.model.status
          ? this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model.status)
          : '',
      });

      this.menuValues = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/menu`, undefined, undefined, undefined, true, undefined, false),
    );
    }

    this.addEditForm.get('type')?.valueChanges.subscribe((value) => {
      if(value !== NotificationTemplateTypeEnum.NOTIFICATION) {
        this.addEditForm.get('menuId')?.setErrors(null);
      }
    });
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/mdm/notification-template/${this.id}/${status}`,
      '',
    );
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
    this.router.navigate([`/mdm/notification-template/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new NotificationTemplateModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/notification-template/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/notification-template`, formData);

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
