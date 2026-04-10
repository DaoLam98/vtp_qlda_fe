import { Component, Injector, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  FormStateService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { Config } from 'src/app/common/models/config.model';
import { FORM_CONFIG, mapStatus } from './form-data-collection-search.config';
import { Utils } from 'src/app/shared/utils/utils';
import { lastValueFrom } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { DatePipe } from '@angular/common';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { environment } from 'src/environments/environment';
import { FormDataCollectionModel } from 'src/app/modules/mdm/_models/data-collection.model';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { EnumUtil } from 'src/app/shared/utils/enum.util';
import { FrequencyEnum } from 'src/app/shared/enums/frequency.enum';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'form-data-collection-search',
  standalone: false,
  templateUrl: './form-data-collection-search.component.html',
})

export class FormDataCollectionSearchComponent {
  @Input() isShowBreadcrum: boolean = true;
  @ViewChild('cloudSearchRef') cloudSearchComponent!: CloudSearchComponent;
  moduleName = '';
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  configForm: Config;
  formAdvanceSearch: FormGroup;
  expressionTypeOptions: SelectModel[] = [];
  projectOptions: SelectModel[] = [];
  organizationOptions: SelectModel[] = [];
  informationTypeOptions: SelectModel[] = [];
  frequencyValues: SelectModel[] = [];
  mapStatusOptions: SelectModel[] = [];
  trackBy = '';

  Utils = Utils;
  protected readonly environment = environment;

  get hasAddPermission() {
    return this.permissionCheckingUtil.hasAddPermission(this.configForm?.moduleName ?? '', this.configForm?.name ?? '')
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

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected selectService: SelectValuesService,
    protected datePipe: DatePipe,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected dateUtilService: DateUtilService,
  ) {
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.moduleName = this.configForm.name || '';
    this.formAdvanceSearch = formBuilder.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}));
  }

  async ngOnInit() {
    this.initTable();
    await this.initOptionValues();
    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
  }

  async initOptionValues() {
    const expressionTypeRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/expression-type`,
      [
        { key: 'sortDirection', value: 'asc,asc' },
        { key: 'sortBy', value: 'status,name' },
      ],
      undefined,
      undefined,
      false,
      undefined,
      true
    ));
    this.expressionTypeOptions = expressionTypeRes.map(option => ({
      ...option,
      disabled: false
    }));
    const projectRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/project/project`,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      true
    ));
    this.projectOptions = projectRes.map(option => ({
      ...option,
      disabled: false
    }));
    const porganizationRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/organization`,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      true
    ));
    this.organizationOptions = porganizationRes.map(option => ({
      ...option,
      disabled: false
    }));
    const informationTypeRes = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/information-type`,
      [
        { key: 'sortDirection', value: 'asc,asc' },
        { key: 'sortBy', value: 'status,name' },
      ],
      undefined,
      undefined,
      false,
      undefined,
      true
    ));
    this.informationTypeOptions = informationTypeRes.map(option => ({
      ...option,
      disabled: false
    }));
    this.mapStatusOptions = [
      {
        value: -1,
        disabled: false,
        displayValue: this.translateService.instant("common.combobox.option.default"),
        rawData: -1,
      },
      ...mapStatus.map(status => ({
        value: status.value,
        disabled: false,
        displayValue: status.displayValue,
        rawData: null,
      }))
    ]
  }

  initTable(): void {
    this.columns.push(
      {
        columnDef: 'createdDate',
        header: 'createdDate',
        className: 'mat-column-createdDate',
        title: (e: FormDataCollectionModel) => this.dateUtilService.convertDateToDisplayServerTime(e.createdDate || '') || '',
        cell: (e: FormDataCollectionModel) => this.dateUtilService.convertDateToDisplayServerTime(e.createdDate || '') || '',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'projectName',
        header: 'projectName',
        className: 'mat-column-projectName',
        title: (e: FormDataCollectionModel) => `${e.projectName || ''}`,
        cell: (e: FormDataCollectionModel) => `${e.projectName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organizationName',
        header: 'organizationName',
        className: 'mat-column-organizationName',
        title: (e: FormDataCollectionModel) => `${e.organizationName || ''}`,
        cell: (e: FormDataCollectionModel) => `${e.organizationName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'expressionInformationTypeName',
        header: 'expressionInformationTypeName',
        className: 'mat-column-expressionInformationTypeName',
        title: (e: FormDataCollectionModel) => `${e.expressionInformationTypeName || ''}`,
        cell: (e: FormDataCollectionModel) => `${e.expressionInformationTypeName || ''}`,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT
      },
      {
        columnDef: 'dataGatheringStatus',
        header: 'status',
        className: 'mat-column-status',
        title: (e: FormDataCollectionModel) => this.displayNameStatus(e.dataGatheringStatus ?? ''),
        cell: (e: FormDataCollectionModel) => this.displayNameStatus(e.dataGatheringStatus ?? ''),
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      }
    );
    this.buttons.push(
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'viewDetail',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: () => true,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        click: 'addOrEdit',
        className: 'primary content-cell-align-center',
        title: 'common.title.edit',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => this.hasEditPermission,
        disabled: (e) => this.disableEditButton(e),
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'delete',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDelete',
        className: 'primary mat-column-detail',
        title: 'project.data-aggregation.action.delete',
        display: () => this.hasRejectPermission,
        disabled: (e) => this.disableDeleteButton(e),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'accept',
        color: 'primary',
        icon: 'fa fa-check',
        click: 'onApprove',
        className: 'primary content-cell-align-center',
        title: 'btnApprove',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => this.hasApprovePermission,
        disabled: (e) => this.disableApproveRejectButton(e),
        alignHeader: AlignEnum.CENTER
      },
      {
        columnDef: 'reject',
        color: 'warn',
        icon: 'fa fa-ban',
        click: 'onReject',
        className: 'primary content-cell-align-center',
        title: 'btnReject',
        header: 'common.table.action.title',
        iconType: IconTypeEnum.FONT_AWESOME,
        display: () => this.hasApprovePermission,
        disabled: (e) => this.disableApproveRejectButton(e),
        alignHeader: AlignEnum.CENTER
      },
    );
  }

  ngAfterViewInit(): void {
    this.cloudSearchComponent.table.clickAction.subscribe((event: ButtonClickEvent) => {
      switch (event.action) {
        case 'onDelete':
          this.onAction('reject', event.object, 'delete');
          break;
        case 'onApprove':
          this.onUpdateStatus(event.object, 'approve');
          break;
        case 'onReject':
          this.onUpdateStatus(event.object, 'reject');
          break;
      }
    });
  }

  onAction(action: string, row: FormDataCollectionModel, eventType: string): void {
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/data-gathering/${row.id}/${action}`, {});
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.cloudSearchComponent.onSubmit();
      },
      `project.data-aggregation.${eventType}.success`,
      'common.title.confirm',
      undefined,
      `project.data-aggregation.confirm.${eventType}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  onUpdateStatus(itemData: FormDataCollectionModel, status: 'approve' | 'reject'): void {
    const formData = new FormData();
    const payload = {
      ...itemData,
      dataGatheringStatus: status === 'approve' ? 'APPROVED' : 'REJECTED',
    };
    formData.append('body', this.utilsService.toBlobJon(payload));
    const apiCall = this.apiService.put(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${itemData.id}`,
      formData
    );
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.cloudSearchComponent.onSubmit();
      },
      `project.data-aggregation.${status}.success`,
      'common.title.confirm',
      undefined,
      `project.data-aggregation.confirm.${status}`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  disableApproveRejectButton(row: FormDataCollectionModel): boolean {
    return !(row.dataGatheringStatus === 'WAITING');
  }

  disableEditButton(row: FormDataCollectionModel): boolean {
    return !(row.dataGatheringStatus === 'IN_PROGRESS' || row.dataGatheringStatus === 'REJECTED');
  }

  disableDeleteButton(row: FormDataCollectionModel): boolean {
    return !(row.dataGatheringStatus === 'IN_PROGRESS' || row.dataGatheringStatus === 'REJECTED');
  }

  convertField2HttpParamFn = (params: HttpParams, formGroup: FormGroup) => {
    params = params.set('status', 'APPROVED');
    return params;
  };

  displayNameStatus(status: string): string {
    const statusObj = this.mapStatusOptions.find(option => option.value === status);
    return statusObj ? statusObj.displayValue : '';
  }
}
