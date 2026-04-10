import { HttpParams } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlignEnum, ApiService, ColumnModel, SelectModel, UtilsService } from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Config } from 'src/app/common/models/config.model';
import { CloudSearchComponent } from 'src/app/shared/components/base-search/cloud-search.component';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ReportItemModel } from '../../models/report.model';
import { ReportUtils } from '../report.utils';
import { FORM_CONFIG } from './report-summary.config';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrl: './report-summary.component.scss',
  standalone: false,
})
export class ReportSummaryComponent implements OnChanges {
  @Input() organizationValues: SelectModel[] = [];
  @Input() projectTypeValues: SelectModel[] = [];
  @Input() projectValues: SelectModel[] = [];
  @Input() informationTypeValues: SelectModel[] = [];
  @Input() hasExportPermission = false;
  @ViewChild('cloudSearch') cloudSearch!: CloudSearchComponent;
  columns: ColumnModel[] = [];
  readonly Utils = Utils;
  readonly environment = environment;
  configForm: Config;
  formAdvanceSearch: FormGroup;
  isShowTable = false;
  searchParams = new HttpParams();
  projectValuesFiltered: SelectModel[] = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected utilsService: UtilsService,
    protected apiService: ApiService,
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

    this.columns = [
      {
        columnDef: 'target',
        header: 'target',
        title: (e) => e.targetName,
        cell: (e) => e.targetName,
        alignHeader: AlignEnum.CENTER,
      },
      {
        columnDef: 'planned',
        header: 'planned',
        title: (e: ReportItemModel) => this.getPlannedValue(e),
        cell: (e: ReportItemModel) => this.getPlannedValue(e),
        className: 'mat-column-planned',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'actual',
        header: 'actual',
        title: (e: ReportItemModel) => this.getActualValue(e),
        cell: (e: ReportItemModel) => this.getActualValue(e),
        className: 'mat-column-actual',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'rate',
        header: 'rate',
        title: (e: ReportItemModel) => this.getRateValue(e),
        cell: (e: ReportItemModel) => this.getRateValue(e),
        className: 'mat-column-rate',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
    ];

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
    params = params.set('reportType', 'SUMMARY');
    this.searchParams = params;

    return params;
  };

  async onSearch() {
    this.isShowTable = true;
    this.cloudSearch.onSubmit();
  }

  onDownload() {
    let params = new HttpParams();
    const informationTypeName =
      this.informationTypeValues.find((i) => i.value === Number(this.searchParams.get('expressionInformationTypeId')))
        ?.displayValue || '';
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
      .set('templateCode', 'EXPORT_SUMMARY_REPORT')
      .set('informationTypeName', informationTypeName)
      .set('organizationName', organizationName)
      .set('projectTypeName', projectTypeName)
      .set('projectName', projectName);
    ReportUtils.onDownload(params, this.apiService, this.utilsService);
  }

  onReset() {
    this.cloudSearch.onResetForm();
    this.isShowTable = false;
    this.formAdvanceSearch.markAsPristine();
  }

  getPlannedValue(e: ReportItemModel) {
    if (e.targetDataType === 'STRING') {
      return e.plannedValueString || '';
    }
    if (e.targetDataType === 'NUMBER') {
      return Utils.formatCurrency(e.plannedValueNumber || 0);
    }
    return '';
  }

  getActualValue(e: ReportItemModel) {
    if (e.targetDataType === 'STRING') {
      return e.actualValueString || '';
    }
    if (e.targetDataType === 'NUMBER') {
      return Utils.formatCurrency(e.actualValueNumber || 0);
    }
    return '';
  }

  getRateValue(e: ReportItemModel) {
    return e.rateStr || '';
  }
}
