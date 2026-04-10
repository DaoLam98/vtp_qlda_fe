import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, Inject, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { ExpressionDetail, ExpressionDetailItem } from 'src/app/modules/mdm/_models/form-configuration.model';
import { TargetModel } from 'src/app/modules/mdm/_models/target.model';
import { NUMBER_DEFAULT, VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';

type Row = {
  [key: string]: number | string | SelectModel[] | null;
};

@Component({
  selector: 'app-popup-add-item',
  templateUrl: './popup-add-item.component.html',
  styleUrl: './popup-add-item.component.scss',
  standalone: false,
})
export class PopupAddItemComponent extends BaseAddEditComponent {
  columns: ColumnModel[] = [];
  buttons: ButtonModel[] = [];
  formControl = new FormControl<Row[]>([], { nonNullable: true });
  expressionDetail: ExpressionDetail;
  apiName: string;
  parentModelIdentityKey: string;
  modelId: number;
  orderKey: string;
  fixFields = ['targetId', 'assetId', 'accountingAccountId']; // Trường cố định của biểu mẫu định lượng
  assetValues: SelectModel[] = [];
  accountingAccountValues: SelectModel[] = [];
  timesMap: { [key: string]: { fromDate: string; toDate: string } } = {};
  isDataAggregation = false;
  readonly MAX_VALUE = 999999999999.99;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected apiService: ApiService,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.expressionDetail = data.expressionDetail;
    this.parentModelIdentityKey = data.parentModelIdentityKey;
    this.modelId = data[this.parentModelIdentityKey];
    this.orderKey = data.orderKey;
    this.isEdit = data.item;
    this.apiName = data.apiName;
    this.assetValues = data.assetValues;
    this.accountingAccountValues = data.accountingAccountValues;
    this.timesMap = data.timesMap;
    this.isDataAggregation = data.isDataAggregation ?? false;

    if (this.isEdit) {
      this.formControl.setValue([structuredClone(data.item)]);
    }
  }

  ngOnInit(): void {
    const oldColumns = [...this.data.columns] as ColumnModel[];
    oldColumns.shift();
    let newColumns: ColumnModel[] = [];

    switch (this.expressionDetail.itemType) {
      case 'QUALITATIVE':
        newColumns = this.initQualitativeColumns(oldColumns);
        break;
      case 'QUANTITATIVE':
        const editRow = this.formControl.value[0];

        if (editRow && editRow.targetId) {
          const targetId = editRow.targetId;
          this.apiService
            .get<TargetModel>(`${environment.PATH_API_V1}/mdm/target/${targetId}`, new HttpParams())
            .subscribe((res) => {
              const assetGroupIds = res.organizations.flatMap((i) => i.assetGroups.map((j: any) => j.assetGroupId));
              editRow.assetValues = [];
              editRow.accountingAccountValues = [];
              editRow.assetValues = this.assetValues.filter(
                (item) =>
                  assetGroupIds.includes(item.rawData.assetGroupId) &&
                  (item.rawData.status == 'APPROVED' || item.value == editRow.assetId),
              );

              editRow.accountingAccountValues = this.accountingAccountValues.filter(
                (item) =>
                  res.accountingAccounts.some((i: any) => i.accountingAccountId == item.value) &&
                  (item.rawData.status == 'APPROVED' || item.value == editRow.accountingAccountId),
              );
            });
        }

        newColumns = this.isDataAggregation ? this.initQuantitativeColumns2(oldColumns) : this.initQuantitativeColumns(oldColumns);
        break;
    }
    this.columns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        title: (e: Row) => `${this.formControl.value.indexOf(e) + 1}`,
        cell: (e: Row) => `${this.formControl.value.indexOf(e) + 1}`,
        align: AlignEnum.CENTER,
      },
      ...newColumns,
    );
    this.buttons.push({
      columnDef: 'detail',
      color: 'primary',
      icon: 'fa fa-trash',
      iconType: IconTypeEnum.FONT_AWESOME,
      click: 'onDeleteValue',
      className: 'primary content-cell-align-center',
      title: 'common.title.delete',
      display: (e) => !this.isEdit,
      header: 'common.table.action.title',
      alignHeader: AlignEnum.CENTER,
    });
    !this.isEdit && this.addRow();
    this.formControl.markAsDirty({ onlySelf: true });
    this.formControl.markAllAsTouched();
  }

  onTableAction(event: ButtonClickEvent) {
    if (event.action == 'onDeleteValue') {
      this.onDeleteValue(event.index!);
    }
  }

  onDeleteValue(index: number) {
    const value = this.formControl.value;
    value.splice(index, 1);
    this.formControl.setValue(value);
  }

  addRow() {
    let row: Row = {};
    for (const column of this.columns.slice(1)) {
      if (column.columnType == ColumnTypeEnum.INPUT_CURRENCY || column.columnType == ColumnTypeEnum.INPUT_COUNTER) {
        row[column.columnDef] = 0;
      } else {
        row[column.columnDef] = null;
      }
    }
    const rows = this.formControl.value;
    this.formControl.setValue([...rows, row]);
  }

  getQuantitativeColumnType(column: ColumnModel, row: Row) {
    if (column.columnDef === 'total' || this.isDisabled(row, column.columnDef)) {
      return ColumnTypeEnum.VIEW;
    } else if (this.fixFields.includes(column.columnDef)) {
      return ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
    } else if (row?.targetDataType === 'NUMBER') {
      return ColumnTypeEnum.INPUT_COUNTER;
    } else {
      return ColumnTypeEnum.INPUT;
    }
  }

  getColumnType(type: string) {
    switch (type) {
      case 'STRING':
        return ColumnTypeEnum.INPUT;
      case 'NUMBER':
        return ColumnTypeEnum.INPUT_CURRENCY;
      case 'REFERENCE':
        return ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
      case 'DATE':
        return ColumnTypeEnum.DATE_PICKER;
      default:
        return ColumnTypeEnum.INPUT;
    }
  }

  onSubmit() {
    const rows = this.formControl.value;
    const observables: Observable<any>[] = [];
    let listCell = [];

    if (this.expressionDetail.itemType == 'QUANTITATIVE' && this.hasDuplicateTriple(rows)) {
      this.utilsService.showError('project.error.project.proposal.investment.expression.value.duplicate');
      return;
    }

    for (const row of rows) {
      const uuid = uuidv4();
      const columnDefs = Object.keys(row).filter(
        (item) =>
          !item.includes('_cellId') &&
          !item.includes('_optionValues') &&
          ![
            this.orderKey,
            'targetName',
            'assetName',
            'accountingAccountName',
            'targetCode',
            'assetCode',
            'accountingAccountAccountNumber',
            'targetValues',
            'assetValues',
            'accountingAccountValues',
            'total',
            'disabled',
            'targetExpressionSpel',
            'targetExpressionExcel',
            'targetExpressionView',
            'targetExpressionTree',
            'targetId',
            'targetDataType',
            'targetIsCumulative'
          ].includes(item),
      );

      for (const columnDef of columnDefs) {
        let cell = {};
        switch (this.expressionDetail.itemType) {
          case 'QUALITATIVE':
            const expressionDetailItemId = Number.parseInt(columnDef);
            const expressionDetailItem = this.expressionDetail.expressionDetailItems.find(
              (i) => i.id === expressionDetailItemId,
            );
            cell = {
              id: row[columnDef + '_cellId'] ?? null,
              [this.parentModelIdentityKey]: this.modelId,
              itemType: this.expressionDetail.itemType,
              targetDataType: expressionDetailItem?.dataType,
              targetMaxLength: expressionDetailItem?.maxLength,
              targetReferenceTable: expressionDetailItem?.referenceTable,
              valueReferenceTable: expressionDetailItem?.referenceTable,
              valueReferenceTableId: this.getQualitativeValue(
                expressionDetailItem!,
                'REFERENCE',
                row[expressionDetailItemId],
              ),
              valueString: this.getQualitativeValue(expressionDetailItem!, 'STRING', row[expressionDetailItemId]),
              valueNumber: this.getQualitativeValue(expressionDetailItem!, 'NUMBER', row[expressionDetailItemId]),
              valueDate: this.getQualitativeValue(expressionDetailItem!, 'DATE', row[expressionDetailItemId]),
              [this.orderKey]: this.getValue(row[this.orderKey], uuid),
              expressionDetailId: this.expressionDetail.id,
              expressionDetailName: this.expressionDetail.name,
              expressionDetailItemId: expressionDetailItemId,
              expressionDetailItemName: expressionDetailItem?.name,
              expressionInformationTypeId: this.data.informationTypeId,
              projectId: this.data.projectId,
              frequency: this.data.frequency,
              status: 'APPROVED',
            };
            listCell.push(cell);
            break;
          case 'QUANTITATIVE':
            if (!this.fixFields.includes(columnDef)) {
              cell = {
                id: row[columnDef + '_cellId'] ?? null,
                [this.parentModelIdentityKey]: this.modelId,
                itemType: this.expressionDetail.itemType,
                targetDataType: row['targetDataType'],
                typeDate: columnDef,
                valueNumber: row['targetDataType'] == 'NUMBER' ? Number(this.getValue(row[columnDef], 0)) : null,
                valueString: row['targetDataType'] == 'STRING' ? this.getValue(row[columnDef], '') : null,
                assetId: row['assetId'],
                accountingAccountId: row['accountingAccountId'],
                targetId: row['targetId'],
                targetName: row['targetName'],
                assetName: row['assetName'],
                accountingAccountName: row['accountingAccountName'],
                targetCode: row['targetCode'],
                assetCode: row['assetCode'],
                accountingAccountAccountNumber: row['accountingAccountAccountNumber'],
                [this.orderKey]: this.getValue(row[this.orderKey], uuid),
                expressionDetailId: this.expressionDetail.id,
                expressionDetailName: this.expressionDetail.name,
                fromDate: this.timesMap[columnDef]?.fromDate,
                toDate: this.timesMap[columnDef]?.toDate,
                projectId: this.data.projectId,
                frequency: this.data.frequency,
                expressionInformationTypeId: this.data.informationTypeId,
                targetExpressionSpel: row['targetExpressionSpel'],
                targetExpressionExcel: row['targetExpressionExcel'],
                targetExpressionView: row['targetExpressionView'],
                targetExpressionTree: row['targetExpressionTree'],
                targetIsCumulative: row['targetIsCumulative'],
                status: 'APPROVED',
              };
              listCell.push(cell);
            }
            break;
        }
      }
    }

    const action = this.isEdit ? 'edit' : 'add';
    const formData = new FormData();
    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/${this.apiName}`, formData);
    formData.append('body', this.utilsService.toBlobJon(listCell));
    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.utilsService.onSuccessFunc(message);
        this.matDialogRef.close(rows);
      },
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

  hasDuplicateTriple(values: Row[]) {
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (
          values[i].targetId === values[j].targetId &&
          values[i].accountingAccountId === values[j].accountingAccountId &&
          values[i].assetId === values[j].assetId
        ) {
          return true;
        }
      }
    }
    return false;
  }

  pushToObservables(observables: Observable<any>[], cell: Object, row: Row, columnDef: string) {
    const formData = new FormData();
    formData.append('body', this.utilsService.toBlobJon(cell));
    const apiCall = row[columnDef + '_cellId']
      ? this.apiService.put(
          `${environment.PATH_API_V1}/project/${this.apiName}/${row[columnDef + '_cellId']}`,
          formData,
        )
      : this.apiService.post(`${environment.PATH_API_V1}/project/${this.apiName}`, formData);
    observables.push(apiCall);
  }

  initQualitativeColumns(columns: ColumnModel[]) {
    return columns.map((item) => {
      const expressionDetailItem = this.expressionDetail.expressionDetailItems.find(
        (i) => i.id!.toString() === item.columnDef,
      );
      const columnType = this.getColumnType(this.getValue(expressionDetailItem?.dataType, ''));
      return {
        ...item,
        columnType: columnType,
        align: columnType === ColumnTypeEnum.INPUT_CURRENCY ? AlignEnum.RIGHT : AlignEnum.LEFT,
        isDecimal: true,
        isRequired: true,
        patternFilter:columnType === ColumnTypeEnum.INPUT_CURRENCY ? `^\\d{0,${expressionDetailItem?.maxLength}}$` : `^.{0,${expressionDetailItem?.maxLength}}$`,
      };
    });
  }

  /** @description Hàm này hiện chỉ nhập được number có 12 chữ số phần nguyên và 2 chữ số phần thập phân (nhập được số âm), ko nhập được string */
  initQuantitativeColumns2(columns: ColumnModel[]) {
    return columns.map((item) => {
      let columnType: ColumnTypeEnum;
      let align: AlignEnum;

      if (item.columnDef === 'total') {
        columnType = ColumnTypeEnum.VIEW;
        align = AlignEnum.RIGHT;
      } else if (this.fixFields.includes(item.columnDef)) {
        columnType = this.isEdit ? ColumnTypeEnum.VIEW : ColumnTypeEnum.MULTI_SELECT_AUTOCOMPLETE;
        align = AlignEnum.CENTER;
      } else {
        columnType = ColumnTypeEnum.INPUT;
        align = AlignEnum.RIGHT;
      }
      return {
        ...item,
        columnType: (e: Row) => this.isDisabled(e, item.columnDef) ? ColumnTypeEnum.VIEW : columnType,
        align: align,
        isDecimal: true,
        isRequired: item.columnDef == 'targetId',
        patternFilter: '^-?\\d{0,12}(\\.\\d{0,2})?$',
      };
    });
  }

  /** @description Hàm này nhập được string hoặc number (nhưng chưa nhập được số âm + chặn được nhập quá 2 chữ số phần thập phân) */
  initQuantitativeColumns(columns: ColumnModel[]) {
    return columns.map((item) => {
      return {
        ...item,
        columnType: (e: Row) => this.getQuantitativeColumnType(item, e),
        align: AlignEnum.RIGHT,
        isDecimal: true,
        isRequired: item.columnDef == 'targetId',
        min: (e: Row) => {
          if (this.getQuantitativeColumnType(item, e) == ColumnTypeEnum.INPUT_COUNTER) {
            return -this.MAX_VALUE;
          }
        },
        max: (e: Row) => {
          if (this.getQuantitativeColumnType(item, e) == ColumnTypeEnum.INPUT_COUNTER) {
            return this.MAX_VALUE;
          }
        },
        pattern: VIETNAMESE_REGEX.source,
      };
    });
  }

  isDisabled(row: Row, fieldName: string): boolean {  
    if(!this.data.isCheckFormulaOnTarget) return false;  
    if(fieldName === 'targetId'){
      return false;
    }
    else {
      return Boolean(row?.disabled);
    }
  }

  getQualitativeValue(expressionDetailItem: ExpressionDetailItem, dataType: string, value: any) {
    if (dataType == 'DATE' && value == '') {
      return null;
    }
    return expressionDetailItem?.dataType === dataType ? value : null;
  }

  getValue<T, U>(value: T, defaultValue: U) {
    return value !== null && value !== undefined && value !== '' ? value : defaultValue;
  }
}
