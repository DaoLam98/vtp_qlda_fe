import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ButtonClickEvent,
  ButtonModel,
  ColumnModel,
  DateUtilService,
  IconTypeEnum,
  NumericInputFormat,
  SelectModel,
  TablePagingResponseModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Observable, lastValueFrom, map } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import {
  ExpressionDetail,
  ExpressionDetailItem,
  FormConfigurationModel,
} from 'src/app/modules/mdm/_models/form-configuration.model';
import { environment } from 'src/environments/environment';
import { ModuleNameEnum } from '../../enums/module.name.enum';
import { Utils } from '../../utils/utils';
import type { CloudSearchComponent } from '../base-search/cloud-search.component';
import { PopupAddItemComponent } from './popup-add-item/popup-add-item.component';
import { PopupUploadComponent } from './popup-upload/popup-upload.component';
import { TargetModel } from 'src/app/modules/mdm/_models/target.model';

@Component({
  selector: 'app-project-item-search',
  templateUrl: './project-item-search.component.html',
  styleUrl: './project-item-search.component.scss',
  standalone: false,
})
export class ProjectItemSearchComponent extends BaseAddEditComponent implements OnChanges {
  @Input() isDisplay = true;
  @Input() frequency!: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  @Input() startDate!: Date;
  @Input() endDate!: Date;
  @Input() orderKey!: string;
  @Input() parentModelIdentityKey!: string;
  @Input() parentModelId!: number;
  @Input() apiName!: string;
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];
  @Input() readonly: boolean = true;
  @Output() isEmptyTabExists = new EventEmitter<boolean>(false);
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChildren('cloudSearchRef') cloudSearchRefs!: QueryList<CloudSearchComponent>;
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  protected readonly FieldType = FieldType;
  formatFun = new NumericInputFormat();
  expressionDetails: ExpressionDetail[] = [];
  columnsMaps: { [key: number]: ColumnModel[] } = {};
  buttons: ButtonModel[] = [];
  configFormMaps: { [key: number]: Config } = {};
  formAdvanceSearchMaps: { [key: number]: FormGroup } = {};
  convertField2HttpParamFnMaps: { [key: number]: (params: HttpParams, formGroup: FormGroup) => HttpParams } = {};
  afterSearchFnMaps: { [key: number]: (data: TablePagingResponseModel) => TablePagingResponseModel } = {};
  totalElementsMaps: { [key: number]: number } = {};
  assetValuesCopy: SelectModel[] = [];
  accountingAccountValuesCopy: SelectModel[] = [];
  targetValuesCopy: SelectModel[] = [];
  referenceTables: { key: string; values: SelectModel[] }[] = [];
  timesMap: { [key: string]: { fromDate: string; toDate: string } } = {};
  times: string[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
    protected matDialog: MatDialog,
    protected apiService: ApiService,
    protected fb: FormBuilder,
    protected dateUtilService: DateUtilService,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.assetValuesCopy = this.assetValues.filter((item) => item.rawData.status == 'APPROVED');
    this.accountingAccountValuesCopy = this.accountingAccountValues.filter((item) => item.rawData.status == 'APPROVED');
    this.targetValuesCopy = this.targetValues.filter((item) => item.rawData.status == 'APPROVED');
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.buttons.push(
      {
        columnDef: 'edit',
        color: 'warn',
        icon: 'fa fa-pen',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'edit',
        className: 'primary',
        title: 'common.title.edit',
        display: (e) => !this.readonly,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'delete',
        color: 'primary',
        icon: 'fa fa-trash',
        iconType: IconTypeEnum.FONT_AWESOME,
        click: 'delete',
        className: 'primary',
        title: 'common.title.delete',
        display: (e) => !this.readonly && this.hasRejectPermission,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
  }

  addRow = () => this.openEditPopup();

  openEditPopup(item?: any) {
    const expressionDetail = this.expressionDetails[this.tabGroup.selectedIndex!];
    this.matDialog
      .open(PopupAddItemComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          [this.parentModelIdentityKey]: Number.parseInt(this.parentModelId || this.id),
          parentModelIdentityKey: this.parentModelIdentityKey,
          apiName: this.apiName,
          orderKey: this.orderKey,
          expressionDetail: expressionDetail,
          columns: this.columnsMaps[expressionDetail.id!],
          item: item,
          assetValues: this.assetValues,
          accountingAccountValues: this.accountingAccountValues,
          timesMap: this.timesMap,
        },
      })
      .afterClosed()
      .subscribe((res: any[]) => {
        if (res) {
          this.cloudSearchRefs.get(this.tabGroup.selectedIndex!)?.onSubmit();
          if (!item) {
            this.totalElementsMaps[this.tabGroup.selectedIndex!] += res.length;
            this.isEmptyTabExists.emit(Object.values(this.totalElementsMaps).includes(0));
          }
        }
      });
  }

  async getReferenceData(expressionDetails: ExpressionDetail[]) {
    const referenceTableObservables = expressionDetails
      .flatMap((item) => item.expressionDetailItems)
      .reduce((acc, curr) => {
        const apiName = curr.referenceTable?.replace(/_/g, '-');
        if (curr.dataType == 'REFERENCE' && acc[apiName!] == undefined) {
          acc[apiName!] = this.selectValuesService.getAutocompleteValuesFromModulePath(
            `${environment.PATH_API_V1}/mdm/${apiName}`,
            [
              { key: 'sortBy', value: 'name' },
              { key: 'sortDirection', value: 'asc' },
            ],
            undefined,
            undefined,
            true,
            undefined,
            true,
          );
        }
        return acc;
      }, {} as { [key: string]: Observable<SelectModel[]> });

    return await Promise.all(
      Object.keys(referenceTableObservables).map((key) =>
        lastValueFrom(referenceTableObservables[key]).then((values) => ({ key, values })),
      ),
    );
  }

  onLoadTable(expressionId: number, resetTabIndex?: boolean, startDate?: Date, endDate?: Date, frequency?: string) {
    this.expressionDetails = [];
    this.apiService
      .get<FormConfigurationModel>(`${environment.PATH_API_V1}/mdm/expression/${expressionId}`, new HttpParams())
      .subscribe(async (res) => {
        this.referenceTables = await this.getReferenceData(res.expressionDetails);
        const dateList = await this.getDateList(startDate, endDate, frequency);

        this.timesMap = Object.values(dateList).reduce((acc, item) => {
          acc[item[0]] = { fromDate: `${item[1]}.000Z`, toDate: `${item[2]}.000Z` };
          return acc;
        }, {} as { [key: string]: { fromDate: string; toDate: string } });

        this.times = Object.values(dateList).map((item) => item[0]);

        this.columnsMaps = this.initColumnsMaps(res.expressionDetails);

        this.configFormMaps = this.initConfigFormMaps(res.expressionDetails);

        this.formAdvanceSearchMaps = this.initFormAdvanceSearchMaps(res.expressionDetails);

        this.convertField2HttpParamFnMaps = this.initConvertField2HttpParamFnMaps(res.expressionDetails);

        this.afterSearchFnMaps = this.initAfterSearchFnMaps(res.expressionDetails);

        this.expressionDetails = res.expressionDetails.sort((a, b) => this.getValue(a.displayOrder, 0) - this.getValue(b.displayOrder, 0));

        setTimeout(() => {
          this.cloudSearchRefs.forEach((cloudSearchRef, index) => {
            cloudSearchRef.table.clickAction.subscribe((event: ButtonClickEvent) => {
              switch (event.action) {
                case 'edit':
                  this.openEditPopup(event.object);
                  break;
                case 'delete':
                  this.onDeleteItem(event.object);
                  break;
              }
            });
          });
        });
      });
  }

  getCellValue(row: ExpressionDetailItem, value: any, optionValues: SelectModel[]): any {
    switch (row.dataType) {
      case 'DATE':
        return this.dateUtilService.convertDateToDisplayServerTime(this.getValue(value, ''));
      case 'REFERENCE':
        return this.getValue(optionValues.find((i) => i.value == value)?.displayValue, '');
      case 'NUMBER':
        return this.getCurrencyValue(value);
      default:
        return value;
    }
  }

  getAlignField(type: string) {
    switch (type) {
      case 'NUMBER':
        return AlignEnum.RIGHT;
      case 'DATE':
        return AlignEnum.CENTER;
      default:
        return AlignEnum.LEFT;
    }
  }

  onDeleteItem(item: any) {
    const ids = Object.keys(item)
      .filter((key) => key.includes('_cellId'))
      .map((key) => item[key])
      .join(',');

    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/project/${this.apiName}/${ids}/reject`, {});
    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.utilsService.onSuccessFunc(message);
        this.cloudSearchRefs.get(this.tabGroup.selectedIndex!)?.onSubmit();
        this.totalElementsMaps[this.tabGroup.selectedIndex!] -= 1;
        this.isEmptyTabExists.emit(Object.values(this.totalElementsMaps).includes(0));
      },
      `common.delete.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.delete`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  async getDateList(startDate?: Date, endDate?: Date, frequency?: string) {
    return await lastValueFrom(
      this.apiService.get<{ [key: string]: string[] }>(
        `${environment.PATH_API_V1}/project/date-list`,
        new HttpParams()
          .set('frequency', frequency ?? this.frequency)
          .set('startDate', new Date(startDate ?? this.startDate).toISOString().split('T')[0] + ' 00:00:00')
          .set('endDate', new Date(endDate ?? this.endDate).toISOString().split('T')[0] + ' 00:00:00'),
      ),
    );
  }

  getFieldType(type: string) {
    switch (type) {
      case 'NUMBER':
        return FieldType.NUMBER;
      case 'REFERENCE':
        return FieldType.COMBOBOX;
      case 'DATE':
        return FieldType.DATE_RANGE;
      default:
        return FieldType.COMBOBOX;
    }
  }

  onExportData(templateCode: 'EXPORT_QUANTITATIVE_DATA' | 'TEMPLATE_IMPORT_DL') {
    const currentTabIndex = this.tabGroup.selectedIndex!;
    const currentExpressionDetail = this.expressionDetails[currentTabIndex];

    if (!currentExpressionDetail || !currentExpressionDetail.id) {
      return;
    }

    let params = new HttpParams()
      .set('templateCode', templateCode)
      .set('expressionDetailId', currentExpressionDetail.id.toString())
      .set('expressionDetailName', this.getValue(currentExpressionDetail.name, ''))
      .set(this.parentModelIdentityKey, this.parentModelId || this.id!)
      .set('status', 'APPROVED');

    if (this.frequency) {
      params = params.set('frequency', this.frequency);
    }

    let nativeUrl = `${environment.PATH_API_V1}/project/${this.apiName}/export`;
    const queryParams = [];

    if (this.startDate) {
      const startDateStr = this.startDate.toString();
      const formattedStartDate = `${startDateStr?.split(' ')[0]} 00:00:00`;
      queryParams.push(`startDate=${encodeURIComponent(formattedStartDate)}`);
    }

    if (this.endDate) {
      const endDateStr = this.endDate.toString();
      const formattedEndDate = `${endDateStr?.split(' ')[0]} 23:59:59`;
      queryParams.push(`endDate=${encodeURIComponent(formattedEndDate)}`);
    }

    if (queryParams.length > 0) {
      nativeUrl += '?' + queryParams.join('&');
    }

    this.apiService.saveFile(nativeUrl, null, { params: params }, undefined, (err) => {
      this.utilsService.showErrorToarst('common.microservice.common.exception');
    });
  }

  onUploadData() {
    this.matDialog
      .open(PopupUploadComponent, {
        disableClose: false,
        width: '1000px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          [this.parentModelIdentityKey]: Number.parseInt(this.parentModelId || this.id),
          parentModelIdentityKey: this.parentModelIdentityKey,
          apiName: this.apiName,
          frequency: this.frequency,
          startDate: this.startDate,
          endDate: this.endDate,
          expressionDetailId: this.expressionDetails[this.tabGroup.selectedIndex!].id,
          expressionDetailName: this.expressionDetails[this.tabGroup.selectedIndex!].name,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          const tabSelectedIndex = this.tabGroup.selectedIndex!;
          this.cloudSearchRefs.get(tabSelectedIndex)?.onSubmit();
          const totalElement = await lastValueFrom(
            this.apiService
              .get<TablePagingResponseModel>(
                `${environment.PATH_API_V1}/project/${this.apiName}`,
                new HttpParams()
                  .set('pageNumber', 1)
                  .set('pageSize', 1)
                  .set(this.parentModelIdentityKey, this.parentModelId || this.id!)
                  .set('expressionDetailId', this.expressionDetails[tabSelectedIndex].id!.toString())
                  .set('status', 'APPROVED'),
              )
              .pipe(map((res) => res.page.totalElements)),
          );
          this.totalElementsMaps[tabSelectedIndex] = totalElement!;
          this.isEmptyTabExists.emit(Object.values(this.totalElementsMaps).includes(0));
        }
      });
  }

  get hasImportPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(
        `POST${environment.PATH_API_V1}/${ModuleNameEnum.PROJECT}/${this.apiName}/{${this.parentModelIdentityKey}}/import`,
      )
    );
  }

  get hasExportPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(
        `POST${environment.PATH_API_V1}/${ModuleNameEnum.PROJECT}/${this.apiName}/export`,
      )
    );
  }

  get hasAddPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(`POST${environment.PATH_API_V1}/${ModuleNameEnum.PROJECT}/${this.apiName}`)
    );
  }

  get hasRejectPermission() {
    return (
      this.authoritiesService.hasAuthority('SYSTEM_ADMIN') ||
      this.authoritiesService.hasAuthority(
        `POST${environment.PATH_API_V1}/${ModuleNameEnum.PROJECT}/${this.apiName}/{sIds}/reject`,
      )
    );
  }

  initColumnsMaps(expressionDetails: ExpressionDetail[]) {
    return expressionDetails.reduce((acc, curr) => {
      switch (curr.itemType) {
        case 'QUALITATIVE':
          acc[curr.id!] = curr.expressionDetailItems.map((item) => {
            let optionValues: SelectModel[] = [];
            if (item.dataType === 'REFERENCE') {
              optionValues = this.getValue(
                this.referenceTables.find((i) => i.key === item.referenceTable?.replace(/_/g, '-'))?.values,
                [],
              ).filter((i) => i.rawData.status == 'APPROVED');
            }
            return {
              columnDef: `${item.id}`,
              header: () => item.name,
              title: (e) => this.getCellValue(item, e[`${item.id}`], optionValues),
              cell: (e) => this.getCellValue(item, e[`${item.id}`], optionValues),
              alignHeader: AlignEnum.CENTER,
              align: this.getAlignField(item.dataType),
              optionValues: (e) => this.getValue(e[`${item.id}_optionValues`], optionValues),
              pattern: /^(?!\s*$).+/.source,
            };
          });
          break;
        case 'QUANTITATIVE':
          const targetValues = curr.expressionDetailItems
            .filter((item) => item.targetStatus == 'APPROVED')
            .map((item) => new SelectModel(item.targetId, this.getValue(item.targetName, ''), false, item));
          acc[curr.id!] = [
            {
              columnDef: 'targetId',
              header: 'targetId',
              title: (e) => this.getValue(this.targetValues.find((i) => i.value == e.targetId)?.displayValue, ''),
              cell: (e) => this.getValue(this.targetValues.find((i) => i.value == e.targetId)?.displayValue, ''),
              alignHeader: AlignEnum.CENTER,
              optionValues: (e) => this.getValue(e.targetValues, targetValues),
              onCellValueChange: (e) => {
                const target = this.targetValues.find((i) => i.value == e.targetId);
                e.targetName = this.getValue(target?.displayValue, '');
                e.targetCode = this.getValue(target?.rawData.code, '');
                e.assetId = null;
                e.accountingAccountId = null;
                this.apiService
                  .get<TargetModel>(`${environment.PATH_API_V1}/mdm/target/${e.targetId}`, new HttpParams())
                  .subscribe((res) => {
                    const assetGroupIds = res.organizations.flatMap((i) =>
                      i.assetGroups.map((j: any) => j.assetGroupId),
                    );

                    e.assetValues = this.assetValues.filter(
                      (item) => item.rawData.status == 'APPROVED' && assetGroupIds.includes(item.rawData.assetGroupId),
                    );

                    e.accountingAccountValues = this.accountingAccountValues.filter(
                      (item) =>
                        item.rawData.status == 'APPROVED' &&
                        res.accountingAccounts.some((i: any) => i.accountingAccountId == item.value),
                    );
                    e.targetDataType = res.dataType;
                    e.targetExpressionExcel = res?.expressionExcel;
                    e.targetExpressionSpel = res?.expressionSpel;
                    e.targetExpressionView = res?.expressionView;
                    e.targetExpressionTree = res?.expressionTree;
                    e.targetIsCumulative = res?.isCumulative;
                  });
              },
            },
            {
              columnDef: 'assetId',
              header: 'assetId',
              title: (e) => this.getValue(this.assetValues.find((i) => i.value == e.assetId)?.displayValue, ''),
              cell: (e) => this.getValue(this.assetValues.find((i) => i.value == e.assetId)?.displayValue, ''),
              alignHeader: AlignEnum.CENTER,
              optionValues: (e) => this.getValue(e.assetValues, []),
              onCellValueChange: (e) => {
                const asset = this.assetValues.find((i) => i.value == e.assetId);
                e.assetName = this.getValue(asset?.displayValue, '');
                e.assetCode = this.getValue(asset?.rawData.code, '');
              },
            },
            {
              columnDef: 'accountingAccountId',
              header: 'accountingAccountId',
              title: (e) =>
                this.getValue(
                  this.accountingAccountValues.find((i) => i.value == e.accountingAccountId)?.displayValue,
                  '',
                ),
              cell: (e) =>
                this.getValue(
                  this.accountingAccountValues.find((i) => i.value == e.accountingAccountId)?.displayValue,
                  '',
                ),
              alignHeader: AlignEnum.CENTER,
              optionValues: (e) => this.getValue(e.accountingAccountValues, []),
              onCellValueChange: (e) => {
                const accountingAccount = this.accountingAccountValues.find((i) => i.value == e.accountingAccountId);
                e.accountingAccountName = this.getValue(accountingAccount?.displayValue, '');
                e.accountingAccountAccountNumber = this.getValue(accountingAccount?.rawData.accountNumber, '');
              },
            },
            ...this.times.map(
              (time) =>
                ({
                  columnDef: time,
                  header: () => time,
                  title: (e) => this.getCurrencyValue(e[time]),
                  cell: (e) => this.getCurrencyValue(e[time]),
                  alignHeader: AlignEnum.CENTER,
                  align: AlignEnum.RIGHT,
                  onCellValueChange: (e) => {
                    e.total = this.times.reduce((acc, curr) => {
                      const value = Number(this.getValue(e[curr], 0));
                      if (isNaN(value)) {
                        return acc;
                      }
                      return acc + Number(this.getValue(e[curr], 0));
                    }, 0);
                  },
                } as ColumnModel),
            ),
            {
              columnDef: 'total',
              header: () => 'common.total',
              title: (e) => e.targetDataType == "NUMBER" ? this.getCurrencyValue(e.total) : '',
              cell: (e) => e.targetDataType == "NUMBER" ? this.getCurrencyValue(e.total) : '',
              alignHeader: AlignEnum.CENTER,
              align: AlignEnum.RIGHT,
            },
          ];
          break;
        default:
          break;
      }

      return acc;
    }, {} as { [key: string]: ColumnModel[] });
  }

  initConfigFormMaps(expressionDetails: ExpressionDetail[]) {
    return expressionDetails.reduce((acc, curr) => {
      acc[curr.id!] = {
        moduleName: ModuleNameEnum.PROJECT,
        name: this.apiName,
        filterForm: [
          ...(() => {
            switch (curr.itemType) {
              case 'QUANTITATIVE':
                return [
                  {
                    name: 'targetId',
                    label: 'targetId',
                    type: FieldType.COMBOBOX,
                    required: false,
                    isHidden: false,
                    validate: [],
                    options: [],
                  },
                  {
                    name: 'assetId',
                    label: 'assetId',
                    type: FieldType.COMBOBOX,
                    required: false,
                    isHidden: false,
                    validate: [],
                    options: [],
                  },
                  {
                    name: 'accountingAccountId',
                    label: 'accountingAccountId',
                    type: FieldType.COMBOBOX,
                    required: false,
                    isHidden: false,
                    validate: [],
                    options: [],
                  },
                ];
              case 'QUALITATIVE':
                return curr.expressionDetailItems.map((item) => ({
                  name: `data_${item.id}_${item.dataType}`,
                  label: item.name,
                  type: this.getFieldType(item.dataType),
                  required: false,
                  isHidden: false,
                  validate: [],
                  options: this.referenceTables
                    .find((i) => i.key === item.referenceTable?.replace(/_/g, '-'))
                    ?.values.filter((i) => i.rawData.status == 'APPROVED')
                    .map((i) => ({
                      ...i,
                      value: `${i.value}_${item.referenceTable}`,
                    })),
                }));
            }
          })(),
        ],
        sortBy: 'createdDate',
        sortDirection: 'asc',
      };
      return acc;
    }, {} as { [key: number]: Config });
  }

  initFormAdvanceSearchMaps(expressionDetails: ExpressionDetail[]) {
    return expressionDetails.reduce((acc, curr) => {
      acc[curr.id!] = this.fb.group(
        this.configFormMaps[curr.id!].filterForm!.reduce((result: any, item) => {
          result[item.name] = ['', item.validate ?? []];
          return result;
        }, {}),
      );

      return acc;
    }, {} as { [key: number]: FormGroup });
  }

  initConvertField2HttpParamFnMaps(expressionDetails: ExpressionDetail[]) {
    return expressionDetails.reduce((acc, curr) => {
      acc[curr.id!] = (params: HttpParams, formGroup: FormGroup) => {
        Object.keys(formGroup.value).forEach((key) => {
          if (/^data_\d+_STRING$/.test(key) && formGroup.value[key]) {
            formGroup.patchValue({
              [key]: formGroup.value[key].trim(),
            });
          }
        });
        params = params
          .set('itemType', curr.itemType!)
          .set(this.parentModelIdentityKey, this.parentModelId)
          .set('expressionDetailId', curr.id!)
          .set('status', 'APPROVED');
        return params;
      };
      return acc;
    }, {} as { [key: number]: (params: HttpParams, formGroup: FormGroup) => HttpParams });
  }

  initAfterSearchFnMaps(expressionDetails: ExpressionDetail[]) {
    return expressionDetails.reduce((acc1, curr1, index) => {
      let isFirstLoad = true;
      acc1[curr1.id!] = (data: TablePagingResponseModel) => {
        const content = data.content as { [key: string]: any }[];
        const groupedData = content.reduce((acc: { [key: string]: any }[], curr) => {
          const row = acc.find((item) => item[this.orderKey] === curr[this.orderKey]);

          switch (curr.itemType) {
            case 'QUALITATIVE': {
              this.initQualitativeAfterSearchFnMaps(row, curr, acc);
              break;
            }
            case 'QUANTITATIVE': {
              this.initQuantitativeAfterSearchFnMaps(row, curr, acc, curr1.expressionDetailItems);
              break;
            }
          }
          return acc;
        }, [] as { [key: string]: any }[]);

        data.content = groupedData;

        if (isFirstLoad) {
          this.totalElementsMaps[index] = data.page.totalElements as number;
          this.isEmptyTabExists.emit(Object.values(this.totalElementsMaps).includes(0));
          isFirstLoad = false;
        }

        return data;
      };

      return acc1;
    }, {} as { [key: number]: (data: TablePagingResponseModel) => TablePagingResponseModel });
  }

  getValue<T, U>(value: T, defaultValue: U) {
    return value === null || value === undefined ? defaultValue : value;
  }

  getCurrencyValue(value: any) {
    return value == null || value == undefined ? '' : this.Utils.formatCurrency(value);
  }

  getItemValue(value: { [key: string]: any }) {
    switch (value.targetDataType) {
      case 'NUMBER':
        return value.valueNumber;
      case 'STRING':
        return value.valueString;
      case 'REFERENCE':
        return value.valueReferenceTableId;
      case 'DATE':
        return value.valueDate;
      default:
        return null;
    }
  }

  initQualitativeAfterSearchFnMaps(
    row: { [key: string]: any } | undefined,
    curr: { [key: string]: any },
    acc: { [key: string]: any }[],
  ) {
    if (row) {
      this.setValue(row, curr.expressionDetailItemId!, this.getItemValue(curr));
      this.setCellId(row, curr.expressionDetailItemId!, curr.id!);
      this.setOptionValues(row, curr);
    } else {
      const newRow = { [this.orderKey]: curr[this.orderKey]! };
      this.setValue(newRow, curr.expressionDetailItemId!, this.getItemValue(curr));
      this.setCellId(newRow, curr.expressionDetailItemId!, curr.id!);
      this.setOptionValues(newRow, curr);
      acc.push(newRow);
    }
  }

  initQuantitativeAfterSearchFnMaps(
    row: { [key: string]: any } | undefined,
    curr: { [key: string]: any },
    acc: { [key: string]: any }[],
    expressionDetailItems: ExpressionDetailItem[],
  ) {
    const keys = [
      { key: 'assetId', value: curr.assetId },
      { key: 'accountingAccountId', value: curr.accountingAccountId },
      { key: 'targetId', value: curr.targetId },
    ];
    const names = [
      { key: 'assetName', value: curr.assetName },
      { key: 'accountingAccountName', value: curr.accountingAccountName },
      { key: 'targetName', value: curr.targetName },
    ];

    const setRowValue = (row: { [key: string]: any }) => {
      keys.forEach(({ key, value }) => {
        if (value !== undefined) {
          this.setValue(row, key, value);
        }
      });
      names.forEach(({ key, value }) => {
        if (value !== undefined) {
          this.setValue(row, key, value);
        }
      });
      if (curr.typeDate !== undefined) {
        this.setValue(row, curr.typeDate!, this.getValue(curr.valueNumber, curr.valueString));
        this.setCellId(row, curr.typeDate!, curr.id!);
        if (this.times.includes(curr.typeDate)) {
          row['total'] += this.getValue(curr.valueNumber, 0);
        }
      }

      row['targetDataType'] = curr.targetDataType;
      row['targetExpressionExcel'] = curr?.targetExpressionExcel;
      row['targetExpressionSpel'] = curr?.targetExpressionSpel;
      row['targetExpressionView'] = curr?.targetExpressionView;
      row['targetExpressionTree'] = curr?.targetExpressionTree;
      row['assetValues'] = [];
      row['accountingAccountValues'] = [];
      row['targetValues'] = expressionDetailItems
        .filter((item) => item.targetStatus == 'APPROVED' || item.targetId == row['targetId'])
        .map(
          (item) =>
            new SelectModel(item.targetId, this.getValue(item.targetName, ''), item.targetStatus == 'REJECTED', item),
        );
    };

    if (row) {
      setRowValue(row);
    } else {
      const newRow = { [this.orderKey]: curr[this.orderKey]!, total: 0 };
      setRowValue(newRow);
      acc.push(newRow);
    }
  }

  setValue = (obj: any, key: number | string, value: any) => {
    obj[`${key}`] = value;
  };

  setCellId = (obj: any, key: number | string, id: number) => {
    obj[key + '_cellId'] = id;
  };

  setOptionValues = (obj: any, cell: { [key: string]: any }) => {
    obj[cell.expressionDetailItemId! + '_optionValues'] = this.getValue(
      this.referenceTables.find((i) => i.key === cell.targetReferenceTable?.replace(/_/g, '-'))?.values,
      [],
    ).filter((i) => i.rawData.status == 'APPROVED' || i.value == cell.valueReferenceTableId);
  };
}
