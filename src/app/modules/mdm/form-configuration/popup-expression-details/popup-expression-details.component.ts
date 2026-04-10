import { Location } from '@angular/common';
import { Component, Inject, Input, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  ColumnTypeEnum,
  IconTypeEnum,
  SelectModel,
  UtilsService
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../../form-configuration/form-configuration-search/form-configuration.config';
import { ONLY_NUMBER_ORDER_REGEX, VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { ExpressionDetailItem } from '../../_models/form-configuration.model';
import { HttpParams } from '@angular/common/http';
import {delay} from "rxjs";

@Component({
  selector: 'app-popup-expression-details',
  templateUrl: './popup-expression-details.component.html',
  styleUrls: ['./popup-expression-details.component.scss'],
  standalone: false,
})
export class PopupExpressionDetailsComponent extends BaseAddEditComponent {
  @Input() title: string = '';
  moduleName = 'mdm.expression';
  configForm!: Config;
  isViewDetail = false;
  isEditForm = false;

  // Map to hold options for rejected items
  map = new Map<number, SelectModel[]>();

  // Dropdown options
  categoryTypeValues: SelectModel[] = [];
  dataTypeOptionValues: SelectModel[] = [];
  indicatorOptionsValues: SelectModel[] = [];
  attributeOptionsValues: SelectModel[] = [];

  // quantitative
  quantifierIndicatorTableColumns: ColumnModel[] = [];
  quantifierIndicatorTableButtons: ButtonModel[] = [];

  // qualitative
  qualitativeIndicatorTableColumns: ColumnModel[] = [];
  qualitativeIndicatorTableButtons: ButtonModel[] = [];

  // displayOrder pattern
  displayOrderPattern = ONLY_NUMBER_ORDER_REGEX.source;

  errorMessages: Map<string, () => string> = new Map([
    ['min', () => 'mdm.expression.error.min-display-order'],
  ]);

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

  get columnComboboxType() {
    return this.isViewDetail ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE
  }

  // Private / protected properties
  protected readonly environment = environment;

  //Constructor
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected apiService: ApiService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected data: {
      expressionDetailsData: {
        name: string;
        description: string;
        displayOrder: number;
        itemType: string;
        expressionDetailItems: ExpressionDetailItem[];
      };
      isView: boolean;
      isEditForm: boolean;
    },
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.initializeForm();
  }

  onSubmit() {
    const { name, description, itemType, displayOrder, expressionDetailDataItems } = this.addEditForm.value || {};
    this.matDialogRef.close({
      name,
      description,
      itemType,
      displayOrder: Number(displayOrder),
      expressionDetailItems: expressionDetailDataItems,
    });
  }

  onAddDetailItem(): void {
    // Add a new empty item to the current detail's expressionDetailDataItems array
    const newItem = {
      name: '',
      dataType: '',
      maxLength: null,
      targetId: null,
      targetGroupName: '',
      description: '',
    };
    const items = this.addEditForm.get('expressionDetailDataItems')?.value ? [...this.addEditForm.get('expressionDetailDataItems')?.value] : [];
    items.push(newItem);
    this.addEditForm.get('expressionDetailDataItems')?.setValue(items);
  }

  onDeleteIndicator(index: number | null | undefined): void {
    this.removeFromArray('expressionDetailDataItems', index);
  }

  onIndicatorTableRowButtonClick(event: ButtonClickEvent): void {
    switch (event.action) {
      case 'onDeleteIndicator':
        this.onDeleteIndicator(event?.index);
        break;
    }
  }

  async ngOnInit() {
    super.ngOnInit();
    this.initIndicatorTableColumns();
    this.initializeDropdownValues();
    this.addEditForm.get('displayOrder')!.valueChanges
        .pipe(
          delay(0)
        )
        .subscribe(displayOrder => {
          if (displayOrder < 0) {
            this.addEditForm.get('displayOrder')!.patchValue("0", { emitEvent: false });
          }
    });
  }

  private initializeForm(): void {
    this.addEditForm = this.fb.group({
      // Detail form fields (for editing specific expressionDetail)
      name: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      description: ['', [Validators.maxLength(255), Validators.pattern(VIETNAMESE_REGEX)]],
      displayOrder: ['', [Validators.min(1)]],
      itemType: [''],
      expressionDetailDataItems: [[]], // Items for the currently edited detail
    });

    this.addEditForm?.patchValue({
      name: this.data.expressionDetailsData?.name || '',
      description: this.data.expressionDetailsData?.description || '',
      displayOrder: this.data.expressionDetailsData?.displayOrder || '',
      itemType: this.data.expressionDetailsData?.itemType || '',
      expressionDetailDataItems: structuredClone(this.data.expressionDetailsData?.expressionDetailItems || []),
    });
    this.isViewDetail = this.data.isView;
    this.isEditForm = this.data.isEditForm;

    this.addEditForm.markAsDirty({onlySelf: true});
    this.addEditForm.markAllAsTouched();
  }

  private initializeDropdownValues(): void {
    this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/target`,
      [
        { key: 'pageSize', value: 9999 },
        { key: 'sortDirection', value: 'asc' },
        { key: 'sortBy', value: 'code' },
      ],
        undefined,
        '',
        true,
      ).subscribe({
        next: (res) => {
          this.indicatorOptionsValues = res.map((item) => {
            const code = item.rawData.code ?? '';
            const name = item.rawData.name ?? '';
            const inactive = item.disabled
              ? `(${this.translateService.instant('common.inactive')})`
              : '';

            const displayValue = `${code} - ${name} ${inactive}`.trim();

            return {
              value: item.rawData.id,
              displayValue,
              disabled: item.disabled,
              rawData: item.rawData
            };
          });

          // Fill map, each key having approved items and one rejected item if exists
          const dataItems = structuredClone(this.data.expressionDetailsData?.expressionDetailItems || []);
          const rejectedItems = dataItems.filter((item: ExpressionDetailItem) => item.targetStatus === 'REJECTED');
          for (const item of rejectedItems) {
            this.map.set(item.targetId, [new SelectModel(item.targetId,
              `${item.targetCode ?? ''} - ${item.targetName} (${this.translateService.instant('common.inactive')})`,
              true),
              ...this.indicatorOptionsValues]);
          }
        },
    });

    const headers = new HttpParams();
    this.apiService
      .get<[{ tableName: string, value: string }]>(`${environment.PATH_API_V1}/mdm/attribute/tables`, headers)
      .subscribe((options) => {
        this.attributeOptionsValues = options.map((item) => ({
          value: item.tableName,
          displayValue: item.value,
          disabled: false,
          rawData: item
        }));
      }
    );

    this.categoryTypeValues = [
      { value: 'QUANTITATIVE', displayValue: 'Định lượng', disabled: false, rawData: null },
      { value: 'QUALITATIVE', displayValue: 'Định tính', disabled: false, rawData: null },
    ];

    this.dataTypeOptionValues = [
      { value: 'STRING', displayValue: 'String', disabled: false, rawData: null },
      { value: 'NUMBER', displayValue: 'Number', disabled: false, rawData: null },
      { value: 'REFERENCE', displayValue: 'Reference', disabled: false, rawData: null },
      { value: 'DATE', displayValue: 'Date', disabled: false, rawData: null },
    ];
  }


  private initIndicatorTableColumns(): void {
    // quantitative
    this.quantifierIndicatorTableColumns = [
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: ExpressionDetailItem) => this.getRowIndex('expressionDetailDataItems', e),
        cell: (e: ExpressionDetailItem) => this.getRowIndex('expressionDetailDataItems', e),
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'targetId',
        header: 'targetId',
        className: 'mat-column-name',
        title: (e: ExpressionDetailItem) => `${e.targetId || ''}`,
        cell: (e: ExpressionDetailItem) => this.displayTargetName(String(e.targetName), String(e.targetStatus)),
        columnType: this.columnComboboxType,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
        optionValues: (e: ExpressionDetailItem) => this.map.get(e.targetId) || this.indicatorOptionsValues,
        isRequired: !this.isViewDetail,
      },
      {
        columnDef: 'targetGroupName',
        header: 'targetGroupName',
        className: 'mat-column-name',
        title: (e: ExpressionDetailItem) => `${e.targetGroupName || ''}`,
        cell: (e: ExpressionDetailItem) => this.indicatorOptionsValues.find(option => option.value === e.targetId)?.rawData.targetGroupName ?? e.targetGroupName ?? '',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'targetDescription',
        header: 'description',
        className: 'mat-column-description',
        title: (e: ExpressionDetailItem) => `${e.targetDescription || ''}`,
        cell: (e: ExpressionDetailItem) => this.indicatorOptionsValues.find(option => option.value === e.targetId)?.rawData.description ?? e.targetDescription ?? '',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      }
    ];

    // qualitative
    this.qualitativeIndicatorTableColumns = [
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: ExpressionDetailItem) => this.getRowIndex('expressionDetailDataItems', e),
        cell: (e: ExpressionDetailItem) => this.getRowIndex('expressionDetailDataItems', e),
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'name',
        header: 'itemName',
        className: 'mat-column-name',
        title: (e: ExpressionDetailItem) => `${e.name || ''}`,
        cell: (e: ExpressionDetailItem) => `${e.name || ''}`,
        columnType: this.isViewDetail ? ColumnTypeEnum.VIEW : ColumnTypeEnum.INPUT,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
        isRequired: !this.isViewDetail,
        max: () => 255,
        patternFilter: VIETNAMESE_REGEX.source
      },
      {
        columnDef: 'dataType',
        header: 'dataType',
        className: 'mat-column-data-type',
        title: (e: ExpressionDetailItem) => `${e.dataType || ''}`,
        cell: (e: ExpressionDetailItem) => `${e.dataType || ''}`,
        columnType: this.columnComboboxType,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
        optionValues: () => this.dataTypeOptionValues,
        isRequired: !this.isViewDetail,
      },
      {
        columnDef: 'maxLength',
        header: 'maxLength',
        className: 'mat-column-limit-value',
        title: (e: ExpressionDetailItem) => `${e.maxLength || ''}`,
        cell: this.renderMaxLengthCell.bind(this),
        columnType: this.getMaxLengthColumnType.bind(this),
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
        max: (e: ExpressionDetailItem) => e?.dataType === 'STRING' ? 255 : 10,
        optionValues: () => this.attributeOptionsValues,
        isRequired: !this.isViewDetail,
      },
    ];

    this.quantifierIndicatorTableButtons = [
      {
        columnDef: 'delete',
        color: 'warn',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDeleteIndicator',
        className: 'warn content-cell-align-center',
        title: 'common.title.delete',
        display: () => this.displayPermissionCheck(),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      }
    ];

    this.qualitativeIndicatorTableButtons = [
      {
        columnDef: 'delete',
        color: 'warn',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'onDeleteIndicator',
        className: 'warn content-cell-align-center',
        title: 'common.title.delete',
        display: () => this.displayPermissionCheck(),
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      }
    ];
  }

  private renderMaxLengthCell(e: ExpressionDetailItem): string {
    switch (e?.dataType) {
      case 'REFERENCE':
        return this.translateService.instant(`${this.attributeOptionsValues.find((item) => item.value === e.maxLength)?.displayValue || ''}`);
      case 'DATE':
        return '';
      default:
        return `${e.maxLength || ''}`;
    }
  }

  private getMaxLengthColumnType(e: ExpressionDetailItem): ColumnTypeEnum {
    if (this.isViewDetail) return ColumnTypeEnum.VIEW;
    switch (e?.dataType) {
      case 'DATE':
        return ColumnTypeEnum.VIEW;
      case 'REFERENCE':
        return ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
      case 'STRING':
        return ColumnTypeEnum.INPUT_COUNTER;
      case 'NUMBER':
        return ColumnTypeEnum.INPUT_COUNTER;
      default:
        return ColumnTypeEnum.VIEW;
    }
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

  private displayPermissionCheck(): boolean {
    return !this.isViewDetail && (this.hasAddPermission || this.hasEditPermission);
  }

  private getRowIndex(formControlName: string, element: any): string {
    const values = this.addEditForm.get(formControlName)?.value as any[];
    const index = values.indexOf(element) + 1;
    return index > 0 ? index.toString() : '';
  }

  private displayTargetName(targetName: string, targetStatus: string): string {
    return `${targetName || ''}` + `${targetStatus === 'REJECTED' ? ' (' + this.translateService.instant('common.inactive') + ')' : ''}`
  }
}
