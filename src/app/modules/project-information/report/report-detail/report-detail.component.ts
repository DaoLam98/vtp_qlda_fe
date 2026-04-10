import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AlignEnum,
  ApiService,
  ColumnModel,
  ColumnTypeEnum,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, lastValueFrom } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ReportItemModel } from '../../models/report.model';
import { ReportUtils } from '../report.utils';
import { FORM_CONFIG } from './report-detail.config';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.scss',
  standalone: false,
})
export class ReportDetailComponent implements OnChanges {
  @Input() organizationValues: SelectModel[] = [];
  @Input() projectTypeValues: SelectModel[] = [];
  @Input() projectValues: SelectModel[] = [];
  @Input() informationTypeValues: SelectModel[] = [];
  @Input() frequencyValues: SelectModel[] = [];
  @Input() hasExportPermission = false;
  @ViewChild('cloudSearch') cloudSearch!: CloudSearchComponent;
  columns: ColumnModel[] = [];
  superHeaders: ColumnModel[][] = [];
  readonly Utils = Utils;
  readonly environment = environment;
  configForm: Config;
  formAdvanceSearch: FormGroup;
  isShowTable = false;
  searchParams = new HttpParams();
  dateList: string[][] = [];
  pageSize = 10;
  projectValuesFiltered: SelectModel[] = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected utilsService: UtilsService,
    protected apiService: ApiService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected translateService: TranslateService,
  ) {
    this.configForm = FORM_CONFIG;

    this.formAdvanceSearch = formBuilder.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = [item.isMultiSelect ? [] : '', item.validate ?? []];
        return result;
      }, {}),
      {
        validators: [ReportUtils.startBeforeEndDateValidator('startDate', 'endDate')],
      },
    );

    this.formAdvanceSearch
      .get('projectTypeIds')
      ?.valueChanges.pipe(distinctUntilChanged(), debounceTime(0))
      .subscribe((res) => {
        this.projectValuesFiltered = this.projectValues.filter((item) =>
          res.length > 0 ? res.includes(item.rawData.projectTypeId) : true,
        );

        const projectIds = this.formAdvanceSearch.value.projectIds as number[];
        const projectIdsFiltered = projectIds.filter((id) =>
          this.projectValuesFiltered.some((item) => item.value === id),
        );

        this.formAdvanceSearch.patchValue({ projectIds: projectIdsFiltered });
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.projectValuesFiltered = this.projectValues;
  }

  convertField2HttpParamFn = (params: HttpParams) => {
    if (this.formAdvanceSearch.value.organizationIds.length == 0) {
      params = params.set('organizationIds', this.organizationValues.map((item) => item.value).join(','));
    }
    if (this.formAdvanceSearch.value.projectTypeIds.length == 0) {
      params = params.set('projectTypeIds', this.projectTypeValues.map((item) => item.value).join(','));
    }
    if (this.formAdvanceSearch.value.projectIds.length == 0) {
      params = params.set('projectIds', this.projectValuesFiltered.map((item) => item.value).join(','));
    }

    params = params
      .set('reportType', 'DETAILED')
      .set('startDate', `${this.dateList[0][1]}.000Z`)
      .set('endDate', `${this.dateList[this.dateList.length - 1][2]}.000Z`);
    this.searchParams = params;
    return params;
  };

  async getDateList(startDate: Date, endDate: Date, frequency: string) {
    return await lastValueFrom(
      this.apiService.get<{ [key: string]: string[] }>(
        `${environment.PATH_API_V1}/project/date-list`,
        new HttpParams()
          .set('frequency', frequency)
          .set('startDate', new Date(startDate).toISOString().split('T')[0] + ' 00:00:00')
          .set('endDate', new Date(endDate).toISOString().split('T')[0] + ' 00:00:00'),
      ),
    );
  }

  async onSearch() {
    this.pageSize = this.cloudSearch?.paging.pageSize ?? this.pageSize;
    this.isShowTable = false;
    const dateList = await this.getDateList(
      this.formAdvanceSearch.value.startDate,
      this.formAdvanceSearch.value.endDate,
      this.formAdvanceSearch.value.frequency,
    );
    const times = Object.values(dateList).map((item) => item[0]);

    this.dateList = Object.values(dateList);

    this.superHeaders = [
      [
        {
          columnDef: 'target',
          header: 'target',
          title: (e) => '',
          cell: (e) => '',
          alignHeader: AlignEnum.CENTER,
          rowSpan: 2,
        },
        ...times.map(
          (time) =>
            ({
              columnDef: time,
              header: () => time,
              title: (e) => '',
              cell: (e) => '',
              alignHeader: AlignEnum.CENTER,
              colSpan: 3,
            } as ColumnModel),
        ),
      ],
    ];

    this.columns = times.reduce(
      (columns: ColumnModel[], time: string) => {
        columns.push(
          {
            columnDef: `${time}_planned`,
            header: 'planned',
            title: (e: ReportItemModel) => this.getPlannedValue(e, time),
            cell: (e: ReportItemModel) => this.getPlannedValue(e, time),
            className: 'mat-column-planned',
            alignHeader: AlignEnum.CENTER,
            align: AlignEnum.RIGHT,
          },
          {
            columnDef: `${time}_actual`,
            header: 'actual',
            title: (e: ReportItemModel) => this.getActualValue(e, time),
            cell: (e: ReportItemModel) => this.getActualValue(e, time),
            className: 'mat-column-actual',
            alignHeader: AlignEnum.CENTER,
            align: AlignEnum.RIGHT,
          },
          {
            columnDef: `${time}_rate`,
            header: 'rate',
            title: (e: ReportItemModel) => this.getRateValue(e, time),
            cell: (e: ReportItemModel) => this.getRateValue(e, time),
            className: 'mat-column-rate',
            alignHeader: AlignEnum.CENTER,
            align: AlignEnum.RIGHT,
            columnType: ColumnTypeEnum.STYLE_CSS,
            style: (e: ReportItemModel) => {
              return `display: flex;
                background: ${e.periodList.find((item) => item.typeDate === time)?.color};
                width: 100%;
                align-items: center;
                height: 100%;
                justify-content: end;
                padding: 0 5px;
                position: absolute;
                top: 0;`;
            },
          },
        );
        return columns;
      },
      [
        {
          columnDef: 'target-none-display',
          header: 'target',
          title: (e: ReportItemModel) => e.targetName,
          cell: (e: ReportItemModel) => e.targetName,
          headerClassName: 'mat-column-none-display',
          alignHeader: AlignEnum.CENTER,
        } as ColumnModel,
      ],
    );

    this.isShowTable = true;
    this.changeDetectorRef.detectChanges();
    this.cloudSearch.paging.pageSize = this.pageSize;
    this.cloudSearch.onSubmit();
  }

  onDownload() {
    let params = new HttpParams();
    const informationTypeName =
      this.informationTypeValues.find((i) => i.value === Number(this.searchParams.get('expressionInformationTypeId')))
        ?.displayValue || '';
    const frequencyName = this.translateService.instant(
      this.frequencyValues.find((i) => i.value === this.searchParams.get('frequency'))?.displayValue || '',
    );
    const organizationName =
      this.searchParams.get('organizationIds')?.split(',').length === this.organizationValues.length
        ? this.translateService.instant('common.text.all')
        : '';
    const projectTypeName =
      this.searchParams.get('projectTypeIds')?.split(',').length === this.projectTypeValues.length
        ? this.translateService.instant('common.text.all')
        : '';
    const projectName =
      this.searchParams.get('projectIds')?.split(',').length === this.projectValuesFiltered.length
        ? this.translateService.instant('common.text.all')
        : '';

    params = this.searchParams
      .set('templateCode', 'EXPORT_DETAILED_REPORT')
      .set('informationTypeName', informationTypeName)
      .set('frequencyName', frequencyName)
      .set('organizationName', organizationName)
      .set('projectTypeName', projectTypeName)
      .set('projectName', projectName);
    ReportUtils.onDownload(params, this.apiService, this.utilsService);
  }

  onReset() {
    this.isShowTable = false;
    this.formAdvanceSearch.reset(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = item.isMultiSelect ? [] : '';
        return result;
      }, {}),
    );
    this.formAdvanceSearch.markAsPristine();
  }

  getPlannedValue(e: ReportItemModel, time: string) {
    const period = e.periodList.find((item) => item.typeDate === time);
    if (e.targetDataType == 'STRING') {
      return period?.plannedValueString || '';
    }
    if (e.targetDataType === 'NUMBER') {
      return Utils.formatCurrency(period?.plannedValueNumber || 0);
    }
    return '';
  }

  getActualValue(e: ReportItemModel, time: string) {
    const period = e.periodList.find((item) => item.typeDate === time);
    if (e.targetDataType == 'STRING') {
      return period?.actualValueString || '';
    }
    if (e.targetDataType === 'NUMBER') {
      return Utils.formatCurrency(period?.actualValueNumber || 0);
    }
    return '';
  }

  getRateValue(e: ReportItemModel, time: string) {
    return e.periodList.find((item) => item.typeDate === time)?.rateStr || '';
  }
}
