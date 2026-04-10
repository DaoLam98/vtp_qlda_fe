import {Component, OnInit} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  BaseStatusEnum, ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  DateUtilService,
  IconTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import {Location} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';
import {ActionTypeEnum} from 'src/app/shared';
import {HttpParams} from '@angular/common/http';
import { catchError, EMPTY } from 'rxjs';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {
  DEFAULT_REGEX,
  ONLY_NUMBER_REGEX,
  VIETNAMESE_REGEX
} from 'src/app/shared/constants/regex.constants';
import {environment} from 'src/environments/environment';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {Config} from 'src/app/common/models/config.model';
import {FORM_CONFIG} from 'src/app/modules/mdm/form-configuration/form-configuration-search/form-configuration.config';
import { ExpressionDetail, FormConfigurationModel } from 'src/app/modules/mdm/_models/form-configuration.model';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';
import {
  PopupChooseOrganizationComponent
} from 'src/app/shared/components/organization/organization-popup-choosen/organization-popup-choosen.component';
import { MatDialog } from '@angular/material/dialog';
import { PopupExpressionDetailsComponent } from '../popup-expression-details/popup-expression-details.component';

@Component({
  selector: 'form-configuration-add-edit-detail',
  standalone: false,
  templateUrl: './form-configuration-add-edit-detail.component.html',
  styleUrls: ['./form-configuration-add-edit-detail.component.scss'],
})
export class FormConfigurationAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  moduleName = 'mdm.expression';
  indicatorOptions: SelectModel[] = [];
  configForm: Config;
  model: FormConfigurationModel | null = null;
  isView = false;
  checkIsActive!: boolean;

  categoryTypeValues: SelectModel[] = [];

  // Table columns and buttons
  orgColumns: ColumnModel[] = [];
  orgButtons: ButtonModel[] = [];

  // Expression Details Table
  expressionDetailsColumns: ColumnModel[] = [];
  expressionDetailsButtons: ButtonModel[] = [];

  actionType: ActionTypeEnum = ActionTypeEnum._ADD;

  expressionTypeOptionsValues: SelectModel[] = [];
  informationTypeOptionsValues: SelectModel[] = [];
  projectTypeOptionsValues: SelectModel[] = [];

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
    this.actionType !== ActionTypeEnum._ADD && this.callAPIGetDetail();
    this.isView && this.addEditForm.get("isUserInput")?.disable();
    this.initializeAllColumns();
    this.categoryTypeValues = [
      { value: 'QUANTITATIVE', displayValue: 'Định lượng', disabled: false, rawData: null },
      { value: 'QUALITATIVE', displayValue: 'Định tính', disabled: false, rawData: null },
    ];
    this.actionType === ActionTypeEnum._ADD && this.initializeDropdownValues();
  }

  private initializeForm(): void {
    this.addEditForm = this.fb.group({
      // Main form fields
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      code: ['', [Validators.maxLength(255), Validators.pattern(DEFAULT_REGEX)]],
      dataType: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.pattern(VIETNAMESE_REGEX)]],
      templateType: ['', [Validators.pattern(ONLY_NUMBER_REGEX)]],
      projectTypes: [''],
      status: [''],
      createdBy: [''],
      createdDate: [''],
      lastModifiedBy: [''],
      lastModifiedDate: [''],
      expressionTypeId: [''],
      informationTypeId: [''],
      isUserInput: [false],

      // Array fields
      organizations: [[]],
      expressionDetails: [[]], // This contains expressionDetailItems as nested array
    });
  }

  private initializeDropdownValues(): void {
    this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/expression-type`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      undefined,
      true,
    ).subscribe((options) => {
      this.expressionTypeOptionsValues = options;
    });
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/information-type`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      undefined,
      true,
    ).subscribe((options) => {
      this.informationTypeOptionsValues = options;
    });
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/project-type`,
      [
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'name' },
      ],
      undefined,
      undefined,
      true,
    ).subscribe((options) => {
      this.projectTypeOptionsValues = options;
    });
  }

  private setActionType(): void {
    this.actionType = this.activatedRoute.routeConfig?.data?.actionType;
    this.isView = this.actionType === ActionTypeEnum._VIEW;
    this.isEdit = this.actionType === ActionTypeEnum._EDIT;
  }

  private initializeAllColumns(): void {
    this.initOrgColumns();
    this.initFormConfigColumns();
  }

  private initOrgColumns(): void {
    this.orgColumns = [
      {
        columnDef: 'stt',
        header: 'stt',
        className: 'mat-column-stt',
        title: (e: OrganizationModel) => this.getRowIndex('organizations', e),
        cell: (e: OrganizationModel) => this.getRowIndex('organizations', e),
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
        columnDef: 'parentName',
        header: 'parentName',
        title: (e: OrganizationModel) => `${e.parentName || ''}`,
        cell: (e: OrganizationModel) => `${e.parentName || ''}`,
        className: 'mat-column-form',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    ];

    this.orgButtons = [
      {
        columnDef: 'delete',
        color: 'warn',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onRemoveOrg',
        className: 'primary content-cell-align-center',
        title: 'common.title.delete',
        display: () => this.displayPermissionCheck(),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      }
    ];
  }

  private initFormConfigColumns(): void {
    this.expressionDetailsColumns = [
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: ExpressionDetail) => this.getRowIndex('expressionDetails', e),
        cell: (e: ExpressionDetail) => this.getRowIndex('expressionDetails', e),
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'tableName',
        className: 'mat-column-name',
        title: (e: ExpressionDetail) => `${e.name || ''}`,
        cell: (e: ExpressionDetail) => `${e.name || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'itemType',
        header: 'itemType',
        className: 'mat-column-name',
        title: (e: ExpressionDetail) => `${e.itemType || ''}`,
        cell: (e: ExpressionDetail) => `${this.categoryTypeValues.find(option => option.value === e.itemType)?.displayValue || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    ];

    this.expressionDetailsButtons = [
      {
        columnDef: 'detail',
        color: 'warn',
        icon: 'fa fa-eye',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onOpenExpressionDetails',
        className: 'primary content-cell-align-center',
        title: 'common.title.detail',
        display: () => this.isView,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onOpenExpressionDetails',
        className: '',
        title: 'common.title.edit',
        display: () => this.displayPermissionCheck(),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'delete',
        color: 'warn',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDeleteFormConfig',
        className: '',
        title: 'common.title.delete',
        display: () => this.displayPermissionCheck(),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      }
    ];
  }

  callAPIGetDetail(): void {
    this.apiService.get<FormConfigurationModel>(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}`,
      new HttpParams()
    )
      .pipe(catchError(() => EMPTY))
      .subscribe(res => {
        //Set response data to form model
        this.model = {
          ...res,
          expressionDetails: res.expressionDetails.map((item) => ({
            ...item,
            expressionDetailItems: item.expressionDetailItems.map((detailItem) => ({
              ...detailItem,
              maxLength: detailItem.dataType === 'REFERENCE' ? detailItem.referenceTable : detailItem.maxLength,
            }))
          }))
        };
        this.initForm(this.model);

        //Set isActive flag based on status        
        this.checkIsActive = res.status === 'APPROVED';

        //Initialize dropdown values
        this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/expression-type`,
            [
              { key: 'sortDirection', value: 'asc' },
              { key: 'sortBy', value: 'name' },
            ],
            undefined,
            undefined,
            true,
            undefined,
            this.isView || this.isEdit,
          ).subscribe((options) => {
            this.expressionTypeOptionsValues = options.filter(option => !option.disabled || option.value === this.model?.expressionTypeId);
          });
        this.selectValuesService.getAutocompleteValuesFromModulePath(
            `${environment.PATH_API_V1}/mdm/information-type`,
            [
              { key: 'sortDirection', value: 'asc' },
              { key: 'sortBy', value: 'name' },
            ],
            undefined,
            undefined,
            true,
            undefined,
            this.isView || this.isEdit,
          ).subscribe((options) => {
            this.informationTypeOptionsValues = options.filter(option => !option.disabled || option.value === this.model?.informationTypeId);
          });
        this.selectValuesService.getAutocompleteValuesFromModulePath(
            `${environment.PATH_API_V1}/mdm/project-type`,
            [
              { key: 'sortDirection', value: 'asc' },
              { key: 'sortBy', value: 'name' },
            ],
            undefined,
            undefined,
            true,
            undefined,
            this.isView || this.isEdit,
          ).subscribe((options) => {
            this.projectTypeOptionsValues = options.filter(option => !option.disabled || this.model?.projectTypes.some((x: any) => x.id === option.value));
          });
      });
  }

  initForm(detailData: FormConfigurationModel): void {
    detailData.createdDate = this.dateUtilService.convertDateToDisplayServerTime(
      detailData.createdDate || ''
    ) || '';
    detailData.lastModifiedDate = this.dateUtilService.convertDateToDisplayServerTime(
      detailData.lastModifiedDate || ''
    ) || '';
    detailData.status = this.isView
      ? this.translateService.instant(
        this.utilsService.getEnumValueTranslated(BaseStatusEnum, detailData.status || '')
      )
      : detailData.status;

    this.addEditForm.patchValue({
      ...detailData,
      projectTypes: detailData.projectTypes.map(x => x.id)
    });
  }

  onSubmit(): void {
    const formData = new FormData();
    const payload = new FormConfigurationModel(this.addEditForm);
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
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/${FORM_CONFIG.moduleName}/${FORM_CONFIG.name}/${this.id}/${status}`,
      ''
    );
    this.utilsService.execute(
      apiCall,
      this.onSuccessFunc,
      `common.${status}.success`,
      `common.confirm.${status}`,
      ['expression.']
    );
  }

  onRowButtonClick(event: ButtonClickEvent): void {
    switch (event.action) {
      case 'onRemoveOrg':
        this.onRemoveOrg(event?.index);
        break;
      case 'onOpenExpressionDetails':
        if (event?.index !== null) {
          this.onOpenExpressionDetails(event?.index);
        } else {
          this.onOpenExpressionDetails();
        }
        break;
      case 'onDeleteFormConfig':
        this.onDeleteFormConfig(event?.index);
        break;
    }
  }


  onRemoveOrg(index: number | null | undefined): void {
    this.removeFromArray('organizations', index);
  }

  onDeleteFormConfig(index: number | null | undefined): void {
    this.removeFromArray('expressionDetails', index);
  }

  onAddOrg(): void {
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
        if (organizations) {
          this.addEditForm.get('organizations')?.patchValue(organizations);
        }
      });
  }

  onRedirect(item: number): void {
    this.router.navigate([`/mdm/form-configuration/edit`, item]).then();
  }

  onOpenExpressionDetails(index?: number): void {
    const dialogRef = this.matDialog
        .open(PopupExpressionDetailsComponent, {
            disableClose: false,
            width: '1500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            data: {
              isEditForm: this.isEdit,
              isView: this.isView,
              expressionDetailsData:  index !== undefined ? this.addEditForm.get('expressionDetails')?.value[index] : undefined
            },
        })

    let title: string;

    if (index === undefined) {
      title = 'common.mdm.create';
    } else {
      title = this.moduleName + (this.isView ? '.table.detail.view' : '.table.detail.edit');
    }
    dialogRef.componentInstance.title = title;
    dialogRef
        .afterClosed()
        .subscribe((itemData: ExpressionDetail) => {
          if(itemData !== undefined && index !== undefined) {
            const expressionDetails = this.addEditForm.get('expressionDetails')?.value ? [...this.addEditForm.get('expressionDetails')?.value] : [];
            // Save current editing changes to nested structure
            expressionDetails[index] = {
              ...expressionDetails[index],
              ...itemData,
            };
            this.addEditForm.get('expressionDetails')?.setValue(expressionDetails);
          }
          else if(itemData !== undefined && index === undefined) {
            // Get current expressionDetails array
            const expressionControl = this.addEditForm.value.expressionDetails ?? [];
            const expressionDetails = [...expressionControl];
            // Add the new detail to the array
            expressionDetails.push(itemData);
            this.addEditForm.get('expressionDetails')?.setValue(expressionDetails);
          }
        });
  }

  private displayPermissionCheck(): boolean {
    return !this.isView && (this.hasAddPermission || this.hasEditPermission);
  }

  private getRowIndex(formControlName: string, element: any): string {
    const values = this.addEditForm.get(formControlName)?.value as any[];
    const index = values.indexOf(element) + 1;
    return index > 0 ? index.toString() : '';
  }

  private removeFromArray(formControlName: string, index: number | null | undefined): void {
    if (index !== null && index !== undefined) {
      const control = this.addEditForm.get(formControlName);
      if (control && Array.isArray(control.value)) {
        const values = [...control.value];
        values.splice(index, 1);
        control.setValue(values);
      }
    }
  }
}
