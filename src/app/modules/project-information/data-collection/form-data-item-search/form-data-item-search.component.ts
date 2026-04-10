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
import { Observable, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import {
  ExpressionDetail,
  ExpressionDetailItem,
  FormConfigurationModel,
} from 'src/app/modules/mdm/_models/form-configuration.model';
import { environment } from 'src/environments/environment';

import { TargetModel } from 'src/app/modules/mdm/_models/target.model';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { Utils } from 'src/app/shared/utils/utils';
import { PopupAddItemComponent } from 'src/app/shared/components/project-item-search/popup-add-item/popup-add-item.component';
import { PopupUploadComponent } from 'src/app/shared/components/project-item-search/popup-upload/popup-upload.component';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';
import { FormDataCollectionModel } from 'src/app/modules/mdm/_models/data-collection.model';

@Component({
  selector: 'app-form-data-item-search',
  templateUrl: './form-data-item-search.component.html',
  styleUrls: ['./form-data-item-search.component.scss'],
  standalone: false,
})
export class FormDataItemSearchComponent extends BaseAddEditComponent implements OnChanges {
  @Input() isDisplay = false;
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
  @Input() orgValues: SelectModel[] = [];
  @Input() readonly: boolean = true;
  @Input() parentModel!: FormDataCollectionModel;
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
  targetValuesMaps: { [key: number]: SelectModel[] } = {};
  referenceTables: { key: string; values: SelectModel[] }[] = [];
  timesMap: { [key: string]: { fromDate: string; toDate: string } } = {};
  times: string[] = [];
  detailTableDataMap: Map<number, any> = new Map();
  dateList = {
    startTime: '',
    endTime: '',
  };


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
  }

  async ngOnInit() {
    super.ngOnInit();
    this.targetValuesCopy = await lastValueFrom(this.selectValuesService.getAutocompleteValuesFromModulePath(
      `${environment.PATH_API_V1}/mdm/target`,
      [{ key: 'isAuthorize', value: true }],
      undefined,
      undefined,
      true
    ));
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
        disabled: (e) => !!e.targetExpressionSpel,
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
        disabled: (e) => !!e.targetExpressionSpel,
        header: 'common.table.action.title',
        alignHeader: AlignEnum.CENTER,
      },
    );
    this.onLoadTable(this.parentModel.expressionId!, true, this.startDate, this.endDate, this.frequency);
  }

  addRow = () => this.openEditPopup();

  async openEditPopup(item?: any) {
    let disabled = false;
    const expressionDetail = this.expressionDetails[this.tabGroup.selectedIndex!];
    if (item?.targetId) {
      const targetData = await lastValueFrom(this.apiService
        .get<TargetModel>(`${environment.PATH_API_V1}/mdm/target/${item.targetId}`, new HttpParams()));
      disabled = !!targetData.expressionSpel;
    }

    this.matDialog
      .open(PopupAddItemComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          [this.parentModelIdentityKey]: Number.parseInt(this.id),
          parentModelIdentityKey: this.parentModelIdentityKey,
          apiName: this.apiName,
          orderKey: this.orderKey,
          expressionDetail: expressionDetail,
          columns: this.columnsMaps[expressionDetail.id!],
          item: item ? { ...item, disabled } : undefined,
          assetValues: this.assetValues,
          accountingAccountValues: this.accountingAccountValues,
          timesMap: this.timesMap,
          projectId: this.parentModel.projectId,
          frequency: this.parentModel.frequency,
          isCheckFormulaOnTarget: true,
          isDataAggregation: true,
          informationTypeId: this.parentModel.expressionInformationTypeId
        },
      })
      .afterClosed()
      .subscribe((res: any[]) => {
        if (res) {
          this.cloudSearchRefs.forEach((cloudSearchRef) => {
            cloudSearchRef?.onSubmit();
          });
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
    this.apiService
      .get<FormConfigurationModel>(`${environment.PATH_API_V1}/mdm/expression/${expressionId}`, new HttpParams())
      .subscribe(async (res) => {
        this.referenceTables = await this.getReferenceData(res.expressionDetails);
        const timesRes = await this.getDateList(startDate, endDate, frequency);
        const timeDataArr = Object.values(timesRes);
        if(timeDataArr.length > 1) {
          this.dateList.startTime = timeDataArr[0][1];
          this.dateList.endTime = timeDataArr[timeDataArr.length - 1][2];
        }else if(timeDataArr.length === 1) {
          this.dateList.startTime = timeDataArr[0][1];
          this.dateList.endTime = timeDataArr[0][2];
        }
        this.timesMap = timeDataArr.reduce((acc, item) => {
          acc[item[0]] = { fromDate: `${item[1]}.000Z`, toDate: `${item[2]}.000Z` };
          return acc;
        }, {} as { [key: string]: { fromDate: string; toDate: string } });
        this.times = timeDataArr.map(item => item[0]);
        this.columnsMaps = this.initColumnsMaps(res.expressionDetails);
        this.targetValuesMaps = res.expressionDetails.reduce((acc, curr) => {
          const targetValues = curr.expressionDetailItems
            .filter((item) => item.targetStatus == 'APPROVED' && this.targetValuesCopy.some(target => target.value == item.targetId))
            .map((item) => new SelectModel(item.targetId, this.getValue(item.targetName, ''), false, item));

          acc[curr.id!] = targetValues;
          return acc;
        }, {} as { [key: number]: SelectModel[] });
        this.configFormMaps = this.initConfigFormMaps(res.expressionDetails);
        this.formAdvanceSearchMaps = this.initFormAdvanceSearchMaps(res.expressionDetails);
        this.convertField2HttpParamFnMaps = this.initConvertField2HttpParamFnMaps(res.expressionDetails);
        this.afterSearchFnMaps = this.initAfterSearchFnMaps(res.expressionDetails);        
        this.expressionDetails = res.expressionDetails.sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
        if (resetTabIndex) {
          this.tabGroup.selectedIndex = 0;
        }
        setTimeout(() => {
          this.cloudSearchRefs.forEach((cloudSearchRef) => {
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
        this.cloudSearchRefs.forEach((cloudSearchRef) => {
            cloudSearchRef?.onSubmit();
          });
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
      this.apiService.get<string[]>(
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
      .set(this.parentModelIdentityKey, this.id!)
      .set('projectId', this.parentModel.projectId!)
      .set('status', 'APPROVED')
      .set('expressionInformationTypeId', this.parentModel.expressionInformationTypeId!);

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
          [this.parentModelIdentityKey]: Number.parseInt(this.id),
          parentModelIdentityKey: this.parentModelIdentityKey,
          apiName: this.apiName,
          frequency: this.frequency,
          startDate: this.startDate,
          endDate: this.endDate,
          expressionDetailId: this.expressionDetails[this.tabGroup.selectedIndex!].id,
          projectId: this.parentModel.projectId,
          expressionDetailName: this.expressionDetails[this.tabGroup.selectedIndex!].name,
          expressionInformationTypeId: this.parentModel.expressionInformationTypeId
        },
      })
      .afterClosed()
      .subscribe((res: any[]) => {
        if (res) {
          this.cloudSearchRefs.forEach((cloudSearchRef) => {
            cloudSearchRef?.onSubmit();
          });
          this.totalElementsMaps[this.tabGroup.selectedIndex!] += Utils.uniqBy(res, this.orderKey).length;
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
            .filter((item) => item.targetStatus == 'APPROVED' && this.targetValuesCopy.some(target => target.value == item.targetId))
            .map((item) => new SelectModel(item.targetId, this.getValue(item.targetName, ''), false, item));
          acc[curr.id!] = [
            {
              columnDef: 'targetId',
              header: 'targetId',
              title: (e) => this.getValue(targetValues.find((i) => i.value == e.targetId)?.displayValue, ''),
              cell: (e) => this.getValue(targetValues.find((i) => i.value == e.targetId)?.displayValue, ''),
              alignHeader: AlignEnum.CENTER,
              optionValues: (e) => this.getValue(e.targetValues, targetValues),
              onCellValueChange: async (e) => {
                const target = targetValues.find((i) => i.value == e.targetId);
                e.targetName = this.getValue(target?.displayValue, '');
                e.targetCode = this.getValue(target?.rawData.targetCode, '');
                e.assetId = null;
                const targetData = await lastValueFrom(this.apiService
                  .get<TargetModel>(`${environment.PATH_API_V1}/mdm/target/${e.targetId}`, new HttpParams()));
                const assetGroupIds = targetData.organizations.filter(org => this.orgValues.some(o => o.value === org.organizationId)).flatMap((i) =>
                  i.assetGroups.map((j: any) => j.assetGroupId),
                );

                e.assetValues = this.assetValues.filter(
                  (item) => item.rawData.status == 'APPROVED' && assetGroupIds.includes(item.rawData.assetGroupId),
                );

                e.accountingAccountValues = this.accountingAccountValues.filter(
                  (item) => {
                    const accountingAccountData = targetData.accountingAccounts.find((acc: any) => acc.accountingAccountId == item.value);
                    return (item.rawData.status == 'APPROVED'
                      && targetData.accountingAccounts.some((acc: any) => acc.accountingAccountId == item.value)
                      && this.orgValues.some((org: any) => accountingAccountData?.organizations.some((o: any) => o.organizationId == org.value))
                    )
                  }
                );

                e.targetDataType = targetData.dataType;
                e.targetIsCumulative = Boolean(targetData.isCumulative);

                //Check if target having formula
                if (!!targetData.expressionSpel) {
                  e.targetExpressionExcel = targetData.expressionExcel;
                  e.targetExpressionSpel = targetData.expressionSpel;
                  e.targetExpressionView = targetData.expressionView;
                  e.targetExpressionTree = targetData.expressionTree;
                  e.targetName = targetData.name;
                  e.targetCode = targetData.code;
                  e.disabled = true;
                  const fromDate = `${String(this.parentModel.startDate).split(' ')[0]} 00:00:00`;
                  const toDate = `${String(this.parentModel.endDate).split(' ')[0]} 23:59:59`;
                  const dateRange = encodeURIComponent(`from=${fromDate},to=${toDate}`);
                  let params = new HttpParams()
                    .set('targetId', e.targetId)
                    .set('itemType', 'QUANTITATIVE')
                    .set('expressionDetailId', Number(curr.id))
                    .set('pageSize', 9999)
                    .set('frequency', this.parentModel.frequency!)
                    .set('pageNumber', 1)
                    .set('status', 'APPROVED')
                    .set('projectId', Number(this.parentModel.projectId))
                    .set('expressionInformationTypeId', Number(this.parentModel.expressionInformationTypeId))                  
                  const aggregationData = await lastValueFrom(this.apiService
                    .get<any>(`${environment.PATH_API_V1}/project/data-gathering-draft-value?toDate=${dateRange}`, params));

                  const aggregationDataValues = [] as number[];
                  this.times.forEach((time) => {
                    const selectedItem = aggregationData.content.find((item: any) => item.typeDate === time);
                    if(selectedItem) {
                      e[time] = selectedItem.targetDataType === 'NUMBER' ? selectedItem?.valueNumber : selectedItem.valueString;                      
                    } 
                    else {
                      e[time] = 0;
                    }
                    aggregationDataValues.push(e[time] ?? 0);
                  });                  
                  e.total = aggregationDataValues.reduce((acc: number, curr: number) => {
                    const numberValue = typeof curr === 'string' ? 0 : Number(curr);
                    return acc + numberValue;
                  }, 0);
                } else {
                  //reset values if not formula
                  e.disabled = false;
                  this.times.forEach((time) => {
                    e[time] = 0;
                  });
                  e.total = 0;
                  e.accountingAccountId = '';
                  e.assetId = '';
                  e.targetExpressionExcel = '';
                  e.targetExpressionSpel = '';
                  e.targetExpressionView = '';
                  e.targetExpressionTree = '';
                }
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
                title: (e) => typeof (e[time]) === 'number' ? this.getCurrencyValue(e[time]) : e[time],
                cell: (e) => typeof (e[time]) === 'number' ? this.getCurrencyValue(e[time]) : e[time],
                alignHeader: AlignEnum.CENTER,
                align: AlignEnum.RIGHT,
                onCellValueChange: (e) => {
                  e.total = this.times.reduce((acc, curr) => acc + Number(this.getValue(e[curr], 0)), 0);
                },
              } as ColumnModel),
            ),
            {
              columnDef: 'total',
              header: () => 'common.total',
              title: (e) => this.getCurrencyValue(e.total),
              cell: (e) => this.getCurrencyValue(e.total),
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
                  {
                    name: 'toDate',
                    label: 'toDate',
                    type: FieldType.DATE_RANGE,
                    validate: [],
                    ignoreReset: true
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
      const defaultForm = this.configFormMaps[curr.id!].filterForm!.reduce((result: any, item) => {
        result[item.name] = ['', item.validate ?? []];
        return result;
      }, {});

      acc[curr.id!] = this.fb.group(
        {
          ...defaultForm,
          toToDate: this.dateList.endTime,
          fromToDate: this.dateList.startTime
        }
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
          .set('expressionDetailId', curr.id!)
          // .set('isAuthorize', true)
          .set('status', 'APPROVED')
          .set(this.parentModelIdentityKey, this.id!)
          .set('frequency', this.parentModel.frequency!)
          .set('expressionInformationTypeId', this.parentModel.expressionInformationTypeId!);
        if (curr.itemType === 'QUANTITATIVE') {
          params = params.set('projectId', this.parentModel.projectId!);
        }
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
        this.detailTableDataMap.set(curr1.id!, groupedData);

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
        if (curr.targetDataType === 'NUMBER') {
          this.setValue(row, curr.typeDate!, curr.valueNumber);
          this.setCellId(row, curr.typeDate!, curr.id!);
          if (this.times.includes(curr.typeDate)) {
            row['total'] += this.getValue(curr.valueNumber, 0);
          }
        }
        else if (curr.targetDataType === 'STRING') {
          this.setValue(row, curr.typeDate!, curr.valueString);
          this.setCellId(row, curr.typeDate!, curr.id!);
        }
      }
      row['assetValues'] = [];
      row['targetDataType'] = curr.targetDataType;
      row['targetExpressionSpel'] = curr.targetExpressionSpel;
      row['accountingAccountValues'] = [];
      row['targetValues'] = expressionDetailItems
        .filter((item) => (item.targetStatus == 'APPROVED' || item.targetId == row['targetId']) && this.targetValuesCopy.some(target => target.value == item.targetId))
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
      this.referenceTables.find((i) => i.key === cell.valueReferenceTable?.replace(/_/g, '-'))?.values,
      [],
    ).filter((i) => i.rawData.status == 'APPROVED' || i.value == cell.valueReferenceTableId);
  };
}
