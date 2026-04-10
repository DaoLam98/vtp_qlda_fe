import {Component, OnInit} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  FileTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {
  PopupChooseOrganizationComponent,
} from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import {MatDialog} from '@angular/material/dialog';
import {EmployeeModel} from 'src/app/shared/components/internal-user/internal-user.model';
import {
  PopupChooseExternalUserComponent,
} from 'src/app/modules/mdm/user/external/external-user-popup-choosen/external-user-popup-choosen.component';
import {PartnerModel} from 'src/app/modules/mdm/_models/partner.model';
import {PartnerPaymentModel} from 'src/app/modules/mdm/_models/partner-payment.model';
import {DEFAULT_REGEX, ONLY_NUMBER_REGEX, VIETNAMESE_REGEX} from 'src/app/shared/constants/regex.constants';
import {OrganizationEnum} from 'src/app/shared/enums/organization.enum';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/partner/partner-search/partner-search.config";
import {environment} from "src/environments/environment";

@Component({
  selector: 'app-partner-add-edit-detail',
  standalone: false,
  templateUrl: './partner-add-edit-detail.component.html',
})
export class PartnerAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.partner';
  configForm: Config;
  model: PartnerModel | null = null;
  isView: boolean = false;
  paymentColumns: ColumnModel[] = [];
  paymentButtons: ButtonModel[] = [];
  orgColumns: ColumnModel[] = [];
  orgButtons: ButtonModel[] = [];
  externalUsersColumns: ColumnModel[] = [];
  externalUsersButtons: ButtonModel[] = [];
  partnerType: any;
  checkIsActive!: boolean;

  partnerValue: SelectModel[] = [
    {
      value: 'BUSINESS',
      displayValue: this.translateService.instant('mdm.partner.business'),
      rawData: 'BUSINESS',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('mdm.partner.individual'),
      value: 'INDIVIDUAL',
      rawData: 'INDIVIDUAL',
      disabled: false,
    },
  ];

  genderValue: SelectModel[] = [
    {
      value: null,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: null,
    },
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

  representIdentifyType: SelectModel[] = [
    {
      value: null,
      disabled: false,
      displayValue: this.translateService.instant("common.combobox.option.default"),
      rawData: null,
    },
    {
      value: 'CCCD',
      displayValue: 'CCCD',
      rawData: 'CCCD',
      disabled: false,
    },
    {
      displayValue: 'CMND',
      value: 'CMND',
      rawData: 'CMND',
      disabled: false,
    },
  ];
  paymentSource$: SelectModel[] = [];
  typeValues: SelectModel[] = [
    {
      value: 'BANK',
      displayValue: this.translateService.instant('payment-source.type.bank'),
      rawData: 'BANK',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('payment-source.type.wallet'),
      value: 'WALLET',
      rawData: 'WALLET',
      disabled: false,
    },
  ];
  readonly FileTypes = FileTypeEnum;
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
    protected selectService: SelectValuesService,
    protected matDialog: MatDialog,
    protected router: Router,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected dateUtilService: DateUtilService,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      type: [this.partnerValue[0].value],
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      address: ['', [Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.maxLength(255), Validators.pattern(ONLY_NUMBER_REGEX)]],
      taxNumber: ['', [Validators.maxLength(255), Validators.pattern(ONLY_NUMBER_REGEX)]],
      email: ['', [Validators.maxLength(255)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      //doanhnghiep
      representName: [null, [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      representIdentifyType: [''],
      representIdentifyNumber: [null, [Validators.maxLength(255), Validators.pattern(ONLY_NUMBER_REGEX)]],
      representIdentifyDate: [null],
      representIdentifyAddress: [null, [Validators.maxLength(255)]],
      representPhone: [null, [Validators.maxLength(20), Validators.pattern(ONLY_NUMBER_REGEX)]],
      representEmail: [null, [Validators.maxLength(255)]],
      representResidenceAddress: [null, [Validators.maxLength(255)]],
      representContactAddress: [null, [Validators.maxLength(255)]],
      representGender: [''],
      representPosition: [null, [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      representBirthday: [null],
      partnerPayments: [],
      organizations: [],
      externalUsers: [],
      contactPhone: [null],
      contactName: [null],
      contactEmail: [null],
      orgForm: [],
      files: [[]],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.initPaymentColumns();
    this.initOrgColumns();
    this.initExternalUsersColumns();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.paymentSource$ = await lastValueFrom(
      this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/payment-source`,
        undefined,
        undefined,
        undefined,
        true,
      )
    );

    if(this.isEdit) {
      this.apiService.get<PartnerModel>(`${environment.PATH_API_V1}/mdm/partner/` + this.id, new HttpParams())
        .subscribe(res => {
          this.model = res;
          if(!this.model) return;

          this.checkIsActive = this.model?.status === 'APPROVED';

          this.model.createdDate = this.dateUtilService.convertDateToDisplayServerTime(
            this.model.createdDate || '') || '';
          this.model.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
            String(this.model.lastModifiedDate)) || '';
          this.model.status = this.isView
            ? this.translateService.instant(
              this.utilsService.getEnumValueTranslated(BaseStatusEnum, String(this.model.status)))
            : this.model.status;

          this.addEditForm.setValue(UtilsService.reduceEntityAttributeForFormControl(this.addEditForm, this.model));

          if(this.model.pathFile) {
            this.downloadFile();
          }
        });
    }

    if(this.addEditForm.get('partnerPayments')?.value?.length === 0) {
      this.onAddRow();
    }
  }

  onChangeType(e: any) {
    this.partnerType = e;
  }

  onUpdateStatus(status: 'approve' | 'reject') {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/partner/${this.id}/${status}`, '');
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
    this.router.navigate([`/mdm/partner/edit`, item]).then();
  }

  onSubmit() {
    const formData = new FormData();
    const fieldsRemove = ['createdDate', 'createdBy', 'lastModifiedDate', 'lastModifiedBy'];

    if(!this.isEdit) {
      fieldsRemove.push('status');
    }

    const businessOnlyFields = [
      'representName',
      'representIdentifyType',
      'representIdentifyNumber',
      'representIdentifyDate',
      'representIdentifyAddress',
      'representPhone',
      'representEmail',
      'representResidenceAddress',
      'representContactAddress',
      'representGender',
      'representPosition',
      'representBirthday',
      'contactPhone',
      'contactName',
      'contactEmail',
    ];

    const partnerType = this.addEditForm.get('type')?.value;
    if(partnerType === 'INDIVIDUAL') {
      fieldsRemove.push(...businessOnlyFields);
    }

    const filteredPayload = Object.keys(this.addEditForm.value)
      .filter((key) => !fieldsRemove.includes(key) && key !== 'files')
      .reduce((obj, key) => {
        obj[key] = this.addEditForm.value[key];
        return obj;
      }, {} as any);

    if(this.isEdit) {
      filteredPayload.id = this.model?.id;
      filteredPayload.status = this.model?.status;
    }

    formData.append('body', this.utilsService.toBlobJon(filteredPayload));

    const files = this.addEditForm.value.files as any[];
    if(files && files.length) {
      files.forEach((f, i) => {
        if(f.binary) {
          formData.append('files', f.binary, f.name);
        }
      });
    }

    const apiCall = this.isEdit
      ? this.apiService.put(`${environment.PATH_API_V1}/mdm/partner/${this.id}`, formData)
      : this.apiService.post(`${environment.PATH_API_V1}/mdm/partner`, formData);

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

  onAddRow() {
    const values = this.addEditForm.get('partnerPayments')?.value as PartnerPaymentModel[];
    this.addEditForm.get('partnerPayments')?.patchValue([
      ...values,
      {
        name: '',
        code: '',
      },
    ]);
  }

  onRemoveRow(index: number) {
    const partnerPayments = this.addEditForm.get('partnerPayments')?.value;
    partnerPayments.splice(index, 1);
    this.addEditForm.get('partnerPayments')?.setValue(partnerPayments);
  }

  onRowButtonClick(event: ButtonClickEvent) {
    switch(event.action) {
      case 'onRemoveExternalUser':
        this.onRemoveExternalUser(event?.index);
        break;
      case 'onRemoveOrg':
        this.onRemoveOrg(event?.index);
        break;
      default:
        this.onRemoveRow(event?.index as number);
        break;
    }
  }

  onRemoveExternalUser(index: number | null | undefined) {
    const externalUsers = this.addEditForm.get('externalUsers')?.value;
    externalUsers.splice(index, 1);
    this.addEditForm.get('externalUsers')?.setValue(externalUsers);
  }

  onRemoveOrg(index: number | null | undefined) {
    const organizations = this.addEditForm.get('organizations')?.value;
    organizations.splice(index, 1);
    this.addEditForm.get('organizations')?.setValue(organizations);
  }

  onAddOrg() {
    this.matDialog
      .open(PopupChooseOrganizationComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          selected: this.addEditForm.get('organizations')?.value,
        },
      })
      .afterClosed()
      .subscribe((organizations: OrganizationModel[]) => {
        if(organizations) {
          this.addEditForm.get('organizations')?.patchValue(organizations);
        }
      });
  }

  onAddExternalUsers() {
    this.matDialog
      .open(PopupChooseExternalUserComponent, {
        disableClose: false,
        width: '1200px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          selected: this.addEditForm.get('externalUsers')?.value
        },
      })
      .afterClosed()
      .subscribe((externalUser: EmployeeModel[]) => {
        if(externalUser) {
          this.addEditForm.get('externalUsers')?.patchValue(externalUser);
        }
      });
  }

  downloadFile() {
    if(!this.model) return;

    const pathFile = this.model.pathFile;
    this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${pathFile}`, new HttpParams()).subscribe(
      (blob) => {
        const file = new File([blob], pathFile, {type: 'text/plain'});
        const files = [{
          name: this.model?.fileName || pathFile,
          id: null,
          previewValue: null,
          type: null,
          binary: file,
          filePath: pathFile
        }];
        this.addEditForm.get('files')?.setValue(files);
      })
  }

  async onDownloadFile($event: any) {
    const filePath = $event.filePath;
    if(!filePath) return;

    try {
      const blob = await firstValueFrom(
        this.apiService.getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = String(this.model?.fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch(error) {
      console.error('Download failed:', error);
    }
  }

  private initPaymentColumns(): void {
    this.paymentColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: PartnerPaymentModel) => `${this.addEditForm.get('partnerPayments')?.value.indexOf(e) + 1}`,
        cell: (e: PartnerPaymentModel) => `${this.addEditForm.get('partnerPayments')?.value.indexOf(e) + 1}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'type',
        header: 'type',
        className: 'mat-column-type',
        title: (e: PartnerPaymentModel) => `${e.type || ''}`,
        cell: (e: PartnerPaymentModel) => `${e.type || ''}`,
        optionValues: (e: any) => this.typeValues,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'paymentSourceId',
        header: 'name',
        className: 'mat-column-paymentSourceId',
        title: (e: PartnerPaymentModel) => {
          const source = this.paymentSource$.find(x => x.value === e.paymentSourceId);
          return source?.displayValue as string;
        },
        cell: (e: PartnerPaymentModel) => {
          const source = this.paymentSource$.find(x => x.value === e.paymentSourceId);
          return source?.displayValue as string;
        },
        optionValues: (e: PartnerPaymentModel) => this.paymentSource$,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'accountNo',
        header: 'accountNo',
        className: 'mat-column-accountNo',
        title: (e: PartnerPaymentModel) => `${e.accountNo || ''}`,
        cell: (e: PartnerPaymentModel) => `${e.accountNo || ''}`,
        isRequired: !this.isView,
        columnType: this.isView ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'isDefault',
        header: 'isDefault',
        className: 'mat-column-isDefault',
        title: (e: PartnerPaymentModel) => `${e.isDefault}`,
        cell: (e: PartnerPaymentModel) => `${e.isDefault}`,
        disabled: (e) => this.isView,
        columnType: (e) => e ? ColumnTypeEnum.CHECKBOX : ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.paymentButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveRow',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: PartnerPaymentModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private initOrgColumns(): void {
    this.orgColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: OrganizationModel) => `${e.name || ''}`,
        cell: (e: OrganizationModel) => `${e.name || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'orgForm',
        header: 'orgForm',
        className: 'mat-column-orgForm',
        title: (e: OrganizationModel) => `${this.utilsService.getEnumValueTranslated(
          OrganizationEnum, String(e.orgForm))}`,
        cell: (e: OrganizationModel) => `${this.utilsService.getEnumValueTranslated(
          OrganizationEnum, String(e.orgForm))}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.orgButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveOrg',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: OrganizationModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private initExternalUsersColumns(): void {
    this.externalUsersColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: EmployeeModel) => {
          const values = this.addEditForm.get('externalUsers')?.value as EmployeeModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: EmployeeModel) => {
          const values = this.addEditForm.get('externalUsers')?.value as EmployeeModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'fullName',
        header: 'fullName',
        className: 'mat-column-fullName',
        title: (e: EmployeeModel) => `${e.fullName || ''}`,
        cell: (e: EmployeeModel) => `${e.fullName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organizationId',
        header: 'organizationName',
        className: 'mat-column-organizationId',
        title: (e: EmployeeModel) => `${e.organizationName || ''}`,
        cell: (e: EmployeeModel) => `${e.organizationName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'email',
        header: 'email',
        className: 'mat-column-email',
        title: (e: EmployeeModel) => `${e.email || ''}`,
        cell: (e: EmployeeModel) => `${e.email || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'phone1',
        header: 'phoneNumber',
        className: 'mat-column-phone1',
        title: (e: EmployeeModel) => `${e.phoneNumber || ''}`,
        cell: (e: EmployeeModel) => `${e.phoneNumber || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
    );

    this.externalUsersButtons.push({
      columnDef: 'delete',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onRemoveExternalUser',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e: EmployeeModel) => this.displayPermissionCheck(),
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
  }

  private displayPermissionCheck(): boolean {
    return !this.isView && (this.hasAddPermission || this.hasEditPermission);
  }
}
