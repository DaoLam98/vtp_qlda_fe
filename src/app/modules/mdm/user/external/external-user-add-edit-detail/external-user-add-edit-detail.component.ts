import {Component, OnInit} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {catchError, distinctUntilChanged, EMPTY, Observable, skipUntil, Subject} from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {
  DEFAULT_REGEX,
  EMAIL_REGEX,
  ONLY_NUMBER_REGEX,
  VIETNAMESE_REGEX
} from 'src/app/shared/constants/regex.constants';
import {environment} from "src/environments/environment";
import {ExternalUserDetailModel, ExternalUserRoleModel} from "src/app/modules/mdm/_models/external-user.model";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/user/external/external-user.config";
import {Utils} from "src/app/shared/utils/utils";

function maxEmailsValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(!control.value) return null;

    const emails = control.value
      .split(';')
      .map((e: string) => e.trim())
      .filter((e: string) => e); // bỏ email trống

    const invalidEmails = emails.filter((email: string) => !EMAIL_REGEX.test(email));

    if(emails.length > max) {
      return {maxThreeEmails: true};
    } else if(invalidEmails.length > 0) {
      return {'pattern': true};
    } else {
      return null;
    }
  };
}

@Component({
  selector: 'app-external-user-add-edit-detail',
  standalone: false,
  templateUrl: './external-user-add-edit-detail.component.html',
})
export class ExternalUserAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.external-user';
  configForm: Config;
  model: ExternalUserDetailModel | null = null;
  isView: boolean = false;
  organizationValues$: Observable<SelectModel[]>;
  checkIsActive!: boolean;
  typeChose: any;
  today = new Date();

  genderValue: SelectModel[] = [
    {
      value: 'MALE',
      disabled: false,
      displayValue: this.translateService.instant('common.gender.male'),
      rawData: 'MALE',
    },
    {
      value: 'FEMALE',
      disabled: false,
      displayValue: this.translateService.instant('common.gender.female'),
      rawData: 'FEMALE',
    },
  ];

  typeValues: SelectModel[] = [
    {
      value: 'COLLABORATOR',
      disabled: false,
      displayValue: this.translateService.instant('mdm.external-user.type.collaborator'),
      rawData: 'COLLABORATOR',
    },
    {
      value: 'PARTNER',
      disabled: false,
      displayValue: this.translateService.instant('mdm.external-user.type.partner'),
      rawData: 'PARTNER',
    },
  ];
  roleColumns: ColumnModel[] = [];
  roleButtons: ButtonModel[] = [];
  roleOptions: SelectModel[] = [];
  orgOptions: SelectModel[] = [];

  actionType: ActionTypeEnum = ActionTypeEnum._ADD;
  inputErrorMsg = new Map<string, () => string>()
    .set('pattern', () => this.translateService.instant('common.message.invalidEmail'))
  typeSubject$: Subject<any> = new Subject();

  protected readonly Utils = Utils;
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
    protected selectValuesService: SelectValuesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      type: ['COLLABORATOR'],
      userName: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      code: ['', [Validators.maxLength(10), Validators.pattern(DEFAULT_REGEX)]],
      fullName: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      email: ['', [maxEmailsValidator(3)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      phoneNumber: ['', [Validators.pattern(ONLY_NUMBER_REGEX)]],
      organizationId: [''],
      gender: [''],
      dob: [''],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
      userRoles: [[]], // Danh sách vai trò
    });

    this.actionType = this.activatedRoute.routeConfig?.data?.actionType;
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;

    this.roleColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt width-5',
        title: (e: ExternalUserRoleModel) => {
          const values = this.addEditForm.get('userRoles')?.value as ExternalUserRoleModel[];
          const index = (values?.indexOf(e) || 0) + 1;
          return index.toString();
        },
        cell: (e: ExternalUserRoleModel) => {
          const values = this.addEditForm.get('userRoles')?.value as ExternalUserRoleModel[];
          const index = (values?.indexOf(e) || 0) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'roleId', // Định nghĩa các key trong formArray
        header: 'role',
        className: 'mat-column-role',
        title: (e: ExternalUserRoleModel) => `${e.roleName}`,
        cell: (e: ExternalUserRoleModel) => `${e.roleName}`,
        optionValues: (e: ExternalUserRoleModel) => this.roleOptions, // Danh sách lựa chọn nếu ô chứa dropdown
        isRequired: !this.isView, // Bắt buộc nhập/chọn
        onCellValueChange: (e: ExternalUserRoleModel) => {
        }, // Hàm onCellValueChange được gọi khi giá trị của ô thay đổi
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE, // Chế độ của dòng : Xem chi tiết hay Thêm mới/Chỉnh sửa
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organizationId',
        header: 'org',
        className: 'mat-column-organizationId',
        title: (e: ExternalUserRoleModel) => `${e.organizationName}`,
        cell: (e: ExternalUserRoleModel) => `${e.organizationName}`,
        optionValues: (e: ExternalUserRoleModel) => this.orgOptions,
        isRequired: !this.isView,
        onCellValueChange: (e: ExternalUserRoleModel) => {
        },
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );

    this.roleButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'deleteRoleRow',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: ExternalUserRoleModel) => !this.isView && (this.hasAddPermission || this.hasEditPermission),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });

    this.organizationValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`);

    this.addEditForm.get('type')?.valueChanges
      .pipe(distinctUntilChanged(), skipUntil(this.typeSubject$))
      .subscribe((type: 'COLLABORATOR' | 'PARTNER') => {
        this.addEditForm.patchValue({
          type: type,
        });

        this.addEditForm.markAsPristine();
        this.addEditForm.markAsUntouched();
        this.addEditForm.updateValueAndValidity();
      });

  }

  async ngOnInit() {
    super.ngOnInit();

    this.callAPIGetRoleOptionList();
    this.callAPIGetOrgOptionList();

    if(this.actionType !== ActionTypeEnum._ADD) {
      this.callAPIGetDetail();
    }

    if(!this.isView) if(this.addEditForm.get('userRoles')?.value?.length === 0) this.addRoleRow();
  }

  callAPIGetDetail() {
    this.apiService.get<ExternalUserDetailModel>(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/` + this.id, new HttpParams())
      .pipe(catchError(error => {
        return EMPTY
      }))
      .subscribe(res => {
        this.model = {...res};
        this.checkIsActive = this.model?.status === 'APPROVED';

        this.initForm(this.model);
        this.organizationValues$ = this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/organization`, undefined, undefined, undefined, true, undefined, false
        );
      })
  }

  initForm(detailData: ExternalUserDetailModel) {
    detailData.createdDate = this.dateUtilService.convertDateToDisplayServerTime(detailData.createdDate || '') || '';
    detailData.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
      detailData.lastModifiedDate || '') || '';
    detailData.status = this.isView
      ? this.translateService.instant(this.utilsService.getEnumValueTranslated(BaseStatusEnum, detailData.status || ''))
      : detailData.status;

    this.addEditForm.patchValue({
      ...detailData,
      organizationId: this.model?.organizationId || '',
    });

    const orgControl = this.addEditForm.get('organizationId');
    if(detailData.type === 'COLLABORATOR') {
      orgControl?.setValidators([Validators.required]);
    } else {
      orgControl?.clearValidators();
      orgControl?.setValue('');
    }

    this.typeSubject$.next(0);
  }

  callAPIGetRoleOptionList() {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/role`,
      undefined,
      undefined,
      undefined,
      true
    ).subscribe(options => {
      this.roleOptions = options;
    })
  }

  callAPIGetOrgOptionList() {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`,
      undefined,
      undefined,
      undefined,
      true
    )
      .subscribe(options => {
        this.orgOptions = options;
      })
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}/${status}`, '');

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
    this.router.navigate([`/mdm/external-user/edit`, item]).then();
  }

  onChangeType(type: 'COLLABORATOR' | 'PARTNER') {
    this.typeChose = type;
    const orgControl = this.addEditForm.get('organizationId');
    if(type === 'COLLABORATOR') {
      orgControl?.setValidators([Validators.required]);
    } else {
      orgControl?.clearValidators();
    }
    orgControl?.updateValueAndValidity();
  }

  addRoleRow() {
    const userRoles = this.addEditForm.get('userRoles')?.value || [];
    (this.addEditForm.get('userRoles') as FormControl)?.patchValue([
      ...userRoles,
      {
        roleId: null, // Trường id tương ứng với columnDef: 'roleId'
        roleName: null,
        organizationId: null, // Trường id tương ứng với columnDef: 'organizationId'
        organizationName: null,
      },
    ]);
  }

  deleteRoleRow(rowData: { id: number }) {
    const values = this.addEditForm.get('userRoles')?.value as { id: number }[];
    if(values.length == 1) {
      return;
    }
    const index = values.indexOf(rowData);
    values.splice(index, 1);
    this.addEditForm.get('userRoles')?.patchValue(values);
  }

  onSubmit() {
    const formData = new FormData();
    const payload = new ExternalUserDetailModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`, formData)
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
}
