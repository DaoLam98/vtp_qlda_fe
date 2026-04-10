import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ButtonModel,
  ColumnModel,
  DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ActionTypeEnum } from 'src/app/shared';
import { HttpParams } from '@angular/common/http';
import { catchError, EMPTY, lastValueFrom, } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { environment } from 'src/environments/environment';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Config } from 'src/app/common/models/config.model';
import { MatDialog } from '@angular/material/dialog';
import { FORM_CONFIG, mapStatus } from '../form-data-collection-search/form-data-collection-search.config';
import { FormDataCollectionModel } from 'src/app/modules/mdm/_models/data-collection.model';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { FrequencyEnum } from 'src/app/shared/enums/frequency.enum';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

@Component({
  selector: 'form-data-collection-add-edit-detail',
  standalone: false,
  templateUrl: './form-data-collection-add-edit-detail.component.html',
  styleUrls: ['./form-data-collection-add-edit-detail.component.scss'],
})
export class FormDataCollectionAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  @ViewChild('itemSearchRef') itemSearchRef!: any;
  moduleName = ModuleNameEnum.PROJECT;
  configForm: Config;
  model!: FormDataCollectionModel;
  isView = false;
  categoryTypeValues: SelectModel[] = [];

  // Table columns and buttons
  orgButtons: ButtonModel[] = [];

  // Expression Details Table
  expressionDetailsColumns: ColumnModel[] = [];
  expressionDetailsButtons: ButtonModel[] = [];

  actionType: ActionTypeEnum = ActionTypeEnum._ADD;

  // Dropdown values
  expressionOptionsValues: SelectModel[] = [];
  informationTypeOptionsValues: SelectModel[] = [];
  projectTypeOptionsValues: SelectModel[] = [];
  projectOptions: SelectModel[] = [];
  organizationOptions: SelectModel[] = [];
  frequencyValues: SelectModel[] = [];
  targetValues: SelectModel[] = [];
  assetValues: SelectModel[] = [];
  accountingAccountValues: SelectModel[] = [];

  orgId: number | null | undefined = null;

  // Environment
  protected readonly environment = environment;

  // Permission getters
  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? ''
    );
  }

  get hasEditPermission() {
    return this.permissionCheckingUtil.hasViewEditPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? ''
    );
  }

  get hasApprovePermission() {
    return this.permissionCheckingUtil.hasViewApprovePermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? ''
    );
  }

  get hasRejectPermission() {
    return this.permissionCheckingUtil.hasViewRejectPermission(
      this.configForm?.moduleName ?? '',
      this.configForm?.name ?? ''
    );
  }

  get btnApplyDisabled(): boolean {
    return this.addEditForm.invalid;
  }

  get displayEditButton(): boolean {
    return this.isView
      && this.hasEditPermission
      && Boolean((this.model?.dataGatheringStatus === 'IN_PROGRESS' || this.model?.dataGatheringStatus === 'REJECTED'));
  }

  get displayApproveRejectButton(): boolean {
    return this.isView && Boolean(this.model?.dataGatheringStatus === 'WAITING') && this.hasApprovePermission;
  }

  get displayCompleteButton(): boolean {
    return this.isEdit && !this.isView && this.hasEditPermission;
  }

  get startDateLimit(): Date {
    return new Date(this.addEditForm.value.endDate);
  }

  get endDateLimit(): Date {
    return new Date(this.addEditForm.value.startDate);
  }

  get displaySaveButton(): boolean {
    return !this.isView && this.hasEditPermission;
  }

  get disableCompleteButton(): boolean {
    if (this.itemSearchRef) {
      const isInValidDetailData = [...this.itemSearchRef.detailTableDataMap.values()].length !== 0 ? [...this.itemSearchRef.detailTableDataMap.values()].some(
        item => Array.isArray(item) && item.length === 0) : true;
      return isInValidDetailData || this.addEditForm.invalid;
    }
    else {
      return true;
    }
  }

  get apiDataItemSearch(): string {
    return this.model.dataGatheringStatus === 'APPROVED' ? 'data-gathering-value' : `data-gathering-draft-value`;
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
    protected matDialog: MatDialog,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.initializeForm();
    this.setActionType();
  }

  async ngOnInit() {
    super.ngOnInit();
    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
    await this.initializeDropdownValues();

    if (this.actionType !== ActionTypeEnum._ADD) {
      this.callAPIGetDetail();
    }
    this.addEditForm.get('expressionId')?.valueChanges.subscribe((value) => {
      const informationTypeId = this.expressionOptionsValues.find(option => option.value === value)?.rawData.informationTypeId;
      const informationTypeData = this.informationTypeOptionsValues.find(option => option.value === informationTypeId)?.rawData;
      this.addEditForm.patchValue({
        expressionInformationTypeId: informationTypeId,
        expressionInformationTypeName: informationTypeData?.name,
      });
      this.itemSearchRef?.clearAllDetailTableData();
    });
  }


  callAPIGetDetail(): void {
    this.apiService.get<FormDataCollectionModel>(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`,
      new HttpParams()
    )
      .pipe(catchError(() => EMPTY))
      .subscribe(res => {
        this.model = res;

        // Fill data to form
        const clonedModel = structuredClone(this.model);
        this.initValueForm({
          ...clonedModel,
          customStatus: mapStatus.find(status => status.value === clonedModel.dataGatheringStatus)?.displayValue || '',
        });

        // Initialize dropdown values in edit mode
        this.expressionOptionsValues = this.expressionOptionsValues.filter(option => !option.disabled || option.value === this.model?.expressionId);
        this.projectTypeOptionsValues = this.projectTypeOptionsValues.filter(option => !option.disabled || option.value === this.model?.expressionInformationTypeId);
        this.projectOptions = this.projectOptions.filter(option => !option.disabled || option.value === this.model?.projectId);
        this.organizationOptions = this.organizationOptions.filter(option => !option.disabled || option.value === this.model?.organizationId);
      });
  }


  onSubmit(isCompleted: boolean): void {
    this.addEditForm.patchValue({
      dataGatheringStatus: isCompleted ? 'WAITING' : 'IN_PROGRESS',
      organizationName: this.organizationOptions.find(option => option.value === this.addEditForm.value.organizationId)?.displayValue || '',
      organizationCode: this.organizationOptions.find(option => option.value === this.addEditForm.value.organizationId)?.rawData.code || '',
      expressionInformationTypeName: this.informationTypeOptionsValues.find(option => option.value === this.addEditForm.value.expressionInformationTypeId)?.displayValue || '',
      expressionName: this.expressionOptionsValues.find(option => option.value === this.addEditForm.value.expressionId)?.displayValue || '',
      expressionCode: this.expressionOptionsValues.find(option => option.value === this.addEditForm.value.expressionId)?.rawData.code || ''
    });

    const formData = new FormData();
    const payload = new FormDataCollectionModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.isEdit
      ? this.apiService.put(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`,
        formData
      )
      : this.apiService.post(
        `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}`,
        formData
      );

    const action = this.isEdit ? 'edit' : 'add';
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${action}.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.${action}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onUpdateStatus(status: 'approve' | 'reject'): void {
    this.addEditForm.patchValue({
      dataGatheringStatus: status === 'approve' ? 'APPROVED' : 'REJECTED',
    });
    const formData = new FormData();
    const payload = new FormDataCollectionModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));
    const apiCall = this.apiService.put(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`,
      formData
    );
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `project.data-aggregation.${status}.success`,
      `project.data-aggregation.confirm.${status}`,
      ['data-aggregation']
    );
  }

  onRedirect(id: number): void {
    this.router.navigate([`/project/form-data-collection/edit`, id]).then();
  }

  onApply() {
    this.addEditForm.patchValue({
      isApplyExpression: true,
      organizationName: this.organizationOptions.find(option => option.value === this.addEditForm.value.organizationId)?.displayValue || '',
      organizationCode: this.organizationOptions.find(option => option.value === this.addEditForm.value.organizationId)?.rawData.code || '',
      expressionInformationTypeName: this.informationTypeOptionsValues.find(option => option.value === this.addEditForm.value.expressionInformationTypeId)?.displayValue || '',
      expressionName: this.expressionOptionsValues.find(option => option.value === this.addEditForm.value.expressionId)?.displayValue || '',
      expressionCode: this.expressionOptionsValues.find(option => option.value === this.addEditForm.value.expressionId)?.rawData.code || ''
    });
    const formData = new FormData();
    const apiCall = this.isEdit ? this.apiService.put(`${environment.PATH_API_V1}/project/data-gathering/${this.id}`, formData) :
      this.apiService.post(`${environment.PATH_API_V1}/project/data-gathering`, formData);

    const payload = new FormDataCollectionModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
      apiCall,
      (data) => {
        if (!this.isEdit) {
          this.router.navigate([`/project/form-data-collection/edit`, data.id])
        } else {
          this.callAPIGetDetail();
        }
      },
      `common.edit.success`,
      ''
    );
  }

  onReset() {
    this.addEditForm.patchValue({
      isApplyExpression: false,
    });
    const formData = new FormData();
    const apiCall = this.isEdit ? this.apiService.put(`${environment.PATH_API_V1}/project/data-gathering/${this.id}`, formData) :
      this.apiService.post(`${environment.PATH_API_V1}/project/data-gathering`, formData);
    const payload = new FormDataCollectionModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
      apiCall,
      () => {
        this.callAPIGetDetail();
      },
      `common.edit.success`,
      'common.title.confirm',
      undefined,
      'project.data-aggregation.expression-change',
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  initValueForm(detailData: FormDataCollectionModel): void {
    this.addEditForm.patchValue({
      ...detailData,
      createdDate: this.dateUtilService.convertDateToDisplayServerTime(
        detailData.createdDate || ''
      ) || '',
      lastModifiedDate: this.dateUtilService.convertDateToDisplayServerTime(
        detailData.lastModifiedDate || ''
      ) || '',
    });
  }

  back(): void {
    this.router.navigate(['/project/form-data-collection']);
  }

  private initializeForm(): void {
    this.addEditForm = this.fb.group({
      createdDate: [''],
      createdBy: [''],
      lastModifiedDate: [''],
      lastModifiedBy: [''],

      id: [''],
      index: [''],
      keyword: [''],

      status: [''],

      projectId: [''],
      projectName: [''],
      projectCode: [''],

      organizationId: [''],
      organizationName: [''],
      organizationCode: [''],

      expressionId: [''],
      expressionName: [''],
      expressionCode: [''],

      expressionInformationTypeId: [''],
      expressionInformationTypeName: [''],

      startDate: [''],
      endDate: [''],

      frequency: [''],
      isApplyExpression: [false],
      dataGatheringStatus: [''],
      customStatus: [''],
    });
  }

  private async initializeDropdownValues(): Promise<void> {
    this.categoryTypeValues = [
      { value: 'QUANTITATIVE', displayValue: 'Định lượng', disabled: false, rawData: null },
      { value: 'QUALITATIVE', displayValue: 'Định tính', disabled: false, rawData: null },
    ];
    const orgId = this.authoritiesService.me?.userAuthentication ? this.authoritiesService.me.userAuthentication.principal?.orgId : null;
    this.expressionOptionsValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/expression`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      'id,code,name,status,informationTypeId',
      true,
      undefined,
      this.isEdit,
    ));
    this.informationTypeOptionsValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/information-type`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      undefined,
      true,
      undefined,
      true
    ));
    this.projectTypeOptionsValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/project-type`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
        { key: 'isIncludeItself', value: this.orgId },
      ],
      undefined,
      undefined,
      true,
      undefined,
      this.isEdit,
    ));
    this.projectOptions = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/project/project`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      undefined,
      true,
      undefined,
      this.isEdit,
    ));    
    this.organizationOptions = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
        { key: 'isIncludeItself', value: orgId },
      ],
      undefined,
      undefined,
      true,
      undefined,
      this.isEdit,
    ));

    this.targetValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/target`,
      [{ key: 'isAuthorize', value: true }],
      undefined,
      undefined,
      true
    ));
    this.assetValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/asset`,
      undefined,
      undefined,
      'id,code,name,status,assetGroupId',
      true,
    ))
    this.accountingAccountValues = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/accounting-account`,
      undefined,
      undefined,
      undefined,
      true,
    ))
  }

  private setActionType(): void {
    this.actionType = this.activatedRoute.routeConfig?.data?.actionType;
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;
  }
}