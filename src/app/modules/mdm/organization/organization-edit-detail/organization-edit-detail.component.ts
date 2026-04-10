import {Component, OnInit} from '@angular/core';
import {
  ActionTypeEnum,
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {Utils} from 'src/app/shared/utils/utils';
import {environment} from 'src/environments/environment';
import {HttpParams} from '@angular/common/http';
import {firstValueFrom, Observable} from 'rxjs';
import {SapBudgetModel} from '../../_models/sap-budget.model';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from "src/app/modules/mdm/organization/organization.config";
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-organization-edit-detail',
  standalone: false,
  templateUrl: './organization-edit-detail.component.html',
})
export class OrganizationEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName: string = 'mdm.organization';
  configForm: Config;
  model: OrganizationModel | null = null;
  isView: boolean = false;
  sapBudgetsColumns: ColumnModel[] = [];
  budgetsColumns: ColumnModel[] = [];
  budgetsButtons: ButtonModel[] = [];
  currencyValue$: Observable<SelectModel[]>;
  orgTypeValue: SelectModel[] = [
    {
      displayValue: this.translateService.instant('common.organization.company'),
      value: 'COMPANY',
      rawData: 'COMPANY',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('common.organization.center'),
      value: 'CENTER',
      rawData: 'CENTER',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('common.organization.branch'),
      value: 'BRANCH',
      rawData: 'BRANCH',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('common.organization.department'),
      value: 'DEPARTMENT',
      rawData: 'DEPARTMENT',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('common.organization.team'),
      value: 'TEAM',
      rawData: 'TEAM',
      disabled: false,
    },
  ];

  orgFormValue: SelectModel[] = [
    {
      displayValue: this.translateService.instant('common.organization.dependent'),
      value: 'DEPENDENT',
      rawData: 'DEPENDENT',
      disabled: false,
    },
    {
      displayValue: this.translateService.instant('common.organization.independent'),
      value: 'INDEPENDENT',
      rawData: 'INDEPENDENT',
      disabled: false,
    },
  ];

  protected readonly Utils = Utils;
  protected readonly environment = environment;

  get orgType(): string {
    return this.addEditForm.get('orgType')?.value;
  }

  get orgForm(): string {
    return this.addEditForm.get('orgForm')?.value;
  }

  get isBranchOrLower(): boolean {
    return ['CENTER', 'BRANCH', 'DEPARTMENT', 'TEAM'].includes(this.orgType);
  }

  get isTopLevelOrg(): boolean {
    return ['COMPANY', 'CORPORATION', 'CENTER'].includes(this.orgType);
  }

  get budgetTypeToShow(): 'SAP' | 'BUDGET' | null {
    if(this.isTopLevelOrg) {
      if(this.orgForm === 'DEPENDENT') return 'SAP';
      if(this.orgForm === 'INDEPENDENT') return 'BUDGET';
    }
    return null;
  }

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
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
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;

    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));

    this.addEditForm = this.fb.group({
      code: [''],
      name: [''],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      isApproveVo: [true],
      sapBudgets: [],
      parentName: [],
      parentId: [],
      costCenter: [],
      orgType: [''],
      orgForm: [''],
      status: [],
      statusDisplay: [],
      createdDate: [],
      createdBy: [],
      lastModifiedDate: [],
      lastModifiedBy: [],
      currencyId: [''],
      currencyName: [],
      budgets: [],
      isTransferOrg: [false],
      address: [],
      longitude: [],
      latitude: [],
    });

    this.currencyValue$ = this.selectService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/currency`,
      undefined,
      undefined,
      undefined,
      true,
      'code'
    );

    this.sapBudgetsColumns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: SapBudgetModel) => {
          const values = this.addEditForm.get('sapBudgets')?.value as SapBudgetModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: SapBudgetModel) => {
          const values = this.addEditForm.get('sapBudgets')?.value as SapBudgetModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'code',
        header: 'code',
        className: 'mat-column-code',
        title: (e: SapBudgetModel) => `${e.code}`,
        cell: (e: SapBudgetModel) => `${e.code}`,
        isRequired: false,
        columnType: ColumnTypeEnum.VIEW,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.LEFT,
      },
      {
        columnDef: 'name',
        header: 'name',
        className: 'mat-column-name',
        title: (e: SapBudgetModel) => `${e.name}`,
        cell: (e: SapBudgetModel) => `${e.name}`,
        isRequired: false,
        columnType: ColumnTypeEnum.VIEW,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.LEFT,
      },
      {
        columnDef: 'budgetAllocated',
        header: 'budgetAllocated',
        className: 'mat-column-budgetAllocated',
        title: (e: SapBudgetModel) => `${e.budgetAllocated}`,
        cell: (e: SapBudgetModel) => `${e.budgetAllocated}`,
        isRequired: false,
        columnType: ColumnTypeEnum.VIEW,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.RIGHT,
      },
      {
        columnDef: 'currencyName',
        header: 'currencyName',
        className: 'mat-column-currencyName',
        title: (e: SapBudgetModel) => `${e.currencyName}`,
        cell: (e: SapBudgetModel) => `${e.currencyName}`,
        isRequired: false,
        columnType: ColumnTypeEnum.VIEW,
        align: AlignEnum.CENTER,
        alignHeader: AlignEnum.LEFT,
      },
    );

    this.addEditForm.get('orgType')?.valueChanges.subscribe(() => {
      this.updateValidator();
    });
  }

  async ngOnInit() {
    super.ngOnInit();

    if(this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<OrganizationModel>(
          `${environment.PATH_API_V1}/mdm/organization/` + this.id, new HttpParams())
      );

      this.addEditForm.patchValue(this.model);
      this.currencyValue$ = this.selectService.getAutocompleteValuesFromModulePath(
        `${environment.PATH_API_V1}/mdm/currency`,
        undefined,
        undefined,
        undefined,
        true,
        undefined,
        false,
      );
    }

    if(this.isView) {
      this.addEditForm.get('isApproveVo')?.disable();
      this.addEditForm.get('isTransferOrg')?.disable();
      this.addEditForm.patchValue({
        createdDate: this.model?.createdDate ? this.dateUtilService.convertDateToDisplayGMT0(
          String(this.model?.createdDate)) : '',
        lastModifiedDate: this.model?.lastModifiedDate ? this.dateUtilService.convertDateToDisplayGMT0(
          String(this.model?.lastModifiedDate)) : '',
        statusDisplay: this.translateService.instant(
          this.utilsService.getEnumValueTranslated(BaseStatusEnum, this.model?.status || ''))
      });
    }
  }

  onSubmit() {
    const formData = new FormData();

    const rawPayload = {
      ...this.addEditForm.value,
      parentId: this?.model?.parentId,
      id: this?.model?.id
    };

    if(this.isBranchOrLower) {
      delete rawPayload.orgForm;
      delete rawPayload.currencyId;
      delete rawPayload.currencyName;
      delete rawPayload.sapBudgets;
      delete rawPayload.budgets;
    }

    formData.append('body', this.utilsService.toBlobJon(rawPayload));

    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/organization/${this.id}`, formData);
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.edit.success`,
      'common.title.confirm',
      [`${this.configForm?.moduleName}.`],
      `common.confirm.edit`,
      undefined,
      undefined,
      "common.button.confirm", // Nút Xác nhận
      "common.button.back" // Nút Quay lại
    );
  }

  onRedirect(item: any) {
    this.router.navigate([`/mdm/organization/edit`, item]).then();
  }

  private updateValidator() {
    const isCheckOrgType = this.isBranchOrLower;
    const orgFormControl = this.addEditForm.get('orgForm');
    const currencyIdControl = this.addEditForm.get('currencyId');

    if(isCheckOrgType) {
      orgFormControl?.clearValidators();
      currencyIdControl?.clearValidators();
    } else {
      orgFormControl?.setValidators([Validators.required]);
      currencyIdControl?.setValidators([Validators.required]);
    }

    orgFormControl?.updateValueAndValidity();
    currencyIdControl?.updateValueAndValidity();
  }
}
