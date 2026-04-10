import {Component, Input, OnInit, Injector} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  ColumnModel,
  SelectModel,
  DateUtilService,
  BaseSearchComponent,
  AuthoritiesService,
  FormStateService,
  UtilsService
} from "@c10t/nice-component-library";
import Chart from "chart.js/auto";
import {FormBuilder} from "@angular/forms";
import {environment} from "src/environments/environment";
import {HttpParams} from '@angular/common/http';
import {ChartOptionsUtils} from 'src/app/shared/utils/ChartOptionsUtils';
import {catchError} from "rxjs/operators";
import {of} from "rxjs";
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {TabModel} from "src/app/modules/project-information/models/tab.model";

import {Config} from "src/app/common/models/config.model";
import {FORM_CONFIG} from './dashboard-detail.config';
import {ChartConfiguration} from "chart.js";
import {RankingProjectModel} from "src/app/modules/project-information/models/ranking-project.model";

@Component({
  selector: 'app-dashboard-detail',
  standalone: false,
  templateUrl: './dashboard-detail.component.html',
  styles: [``],
})
export class DashboardDetailComponent extends BaseSearchComponent implements OnInit {
  @Input() tab!: TabModel;
  @Input() projectTeamValues: SelectModel[] = [];
  @Input() projectValues: SelectModel[] = [];
  @Input() companyValues: SelectModel[] = [];

  get tabId() {
    return this.tab?.id;
  }

  columns: ColumnModel[] = [];
  moduleName: string = '';
  configForm: Config;
  isLoading = false;
  showChart: boolean = false;

  overViewChart!: Chart;
  constructor(
    protected apiService: ApiService,
    protected fb: FormBuilder,
    protected dateUtilService: DateUtilService,
    protected router: Router,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService
  ) {
    super(
      router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute, authoritiesService,
      fb.group({})
    );
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.moduleName = this.configForm.name as string;
    this.searchForm = this.fb.group(this.configForm.filterForm!.reduce((result: any, item) => {
      result[item.name] = item.validate;
      return result;
    }, {}),);

    this.columns.push(
      {
        columnDef: 'index',
        header: 'STT',
        title: (e: RankingProjectModel) => `${e.index || ''}`,
        cell: (e: RankingProjectModel) => `${e.index || ''}`,
        className: 'mat-column-index',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'projectName',
        header: 'projectName',
        title: (e: RankingProjectModel) => `${e.projectName || ''}`,
        cell: (e: RankingProjectModel) => `${e.projectName || ''}`,
        className: 'mat-column-project-name',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'amountPlanned',
        header: 'amountPlanned',
        title: (e: RankingProjectModel) => `${e.amountPlanned || 0}`,
        cell: (e: RankingProjectModel) => `${(e.amountPlanned || 0).toLocaleString('vi-VN')}`,
        className: 'mat-column-amount-planned',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'amountActual',
        header: 'amountActual',
        title: (e: RankingProjectModel) => `${e.amountActual || 0}`,
        cell: (e: RankingProjectModel) => `${(e.amountActual || 0).toLocaleString('vi-VN')}`,
        className: 'mat-column-amount-actual',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
      {
        columnDef: 'amountAccumulated',
        header: 'amountAccumulated',
        title: (e: RankingProjectModel) => `${e.amountAccumulated || 0}`,
        cell: (e: RankingProjectModel) => `${(e.amountAccumulated || 0).toLocaleString('vi-VN')}`,
        className: 'mat-column-amount-accumulated',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.RIGHT,
      },
    )
  }

  ngOnInit() {
    this.search();
    setTimeout(() => this.initLineChart(), 100);
  }

  onSubmit() {
    super.onSubmit()
    this.initLineChart();
  }

  onResetFilter() {
    this.resetSearchFormValue()
    this.search();
    this.initLineChart();
  }

  search() {
    if (!this.tabId) {
      return;
    }
    const url = `${environment.PATH_API_V1}/dashboard/dashboard-tab-config/table/${this.tabId}`;
    const params = this.getProcessedParams();
    this._fillData(url, params, environment.BASE_URL);

  }

  getProcessedParams(): HttpParams {
    const fieldMap = Object.fromEntries(
      Object.keys(this.searchForm.controls).map(key => [key, key])
    );
    let params = this._collectParams(this.searchForm, fieldMap);
    const toDateValue = params.get('toDate');
    if (toDateValue) {
      const datePart = toDateValue.split(' ')[0];
      const formattedDate = `${datePart} 23:59:59`;
      params = params.set('toDate', formattedDate);
    }
    return params;
  }

  emptyParams(params: HttpParams) {
    params.keys().forEach(key => {
      const value = params.get(key) ? params.get(key) + '' : '';
      if (value) {
        params = params.set(key, value.trim());
      }
    });
    const emptyValuesKey = params.keys().filter(key => !params.get(key));
    emptyValuesKey.forEach(key => {
      params = params.delete(key);
    });
    return params;
  }

  initLineChart() {
    if (!this.tabId) {
      return;
    }

    const canvasId = `lineChart-${this.tabId}`;

    if (this.overViewChart) {
      this.overViewChart.destroy();
    }

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    let params = this.getProcessedParams();
    params = this.emptyParams(params);

    this.apiService.get<ChartConfiguration['data']>(
      `${environment.PATH_API_V1}/dashboard/dashboard-tab-config/chart/${this.tabId}`, params
    ).pipe(
      catchError(error => {
        this.showChart = false
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.labels && response.datasets) {
          this.showChart = true
          this.overViewChart = new Chart(ctx, {
            type: 'line',
            data: response,
            options: ChartOptionsUtils.lineChartOptions
          });
        }
      }
    });
  }


  protected readonly environment = environment;
}
