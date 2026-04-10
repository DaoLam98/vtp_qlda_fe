import {AfterViewInit, Component, OnInit, Injector} from '@angular/core';
import {environment} from "src/environments/environment";
import Chart from 'chart.js/auto';
import {ChartConfiguration} from "chart.js";
import {
  ApiService,
  BaseSearchComponent,
  SelectModel,
  AuthoritiesService,
  FormStateService,
  UtilsService, TablePagingResponseModel
} from "@c10t/nice-component-library";
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
  createArrowLabelPlugin,
  createLabelChart,
  DEFAULT_CONFIG_CHART, FORM_CONFIG,
} from "./dashboard.config";
import {ChartOptionsUtils} from "src/app/shared/utils/ChartOptionsUtils";
import {forkJoin, lastValueFrom, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {SummaryCardModel} from "src/app/modules/project-information/models/card.model";
import {RankingCardModel} from "src/app/modules/project-information/models/ranking.model";
import {TabModel} from "src/app/modules/project-information/models/tab.model";
import {RankingProjectModel} from "src/app/modules/project-information/models/ranking-project.model";
import {Config} from "src/app/common/models/config.model";

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent extends BaseSearchComponent implements OnInit, AfterViewInit {
  projectTeamValues: SelectModel[] = [];
  spendingValues: SelectModel[] = [];
  companyValues: SelectModel[] = [];
  projectValues: SelectModel[] = [];
  tabs: TabModel[] = [];
  isLoadingOverview = false;
  selectedTabIndex = 0;
  loadedTabs = new Set<number>();
  moduleName = '';
  configForm: Config;
  doughnutCharts: Chart<'doughnut'>[] = [];
  overViewCharBarLine!: Chart
  arrowLabel = createArrowLabelPlugin(15)
  showLabel = createLabelChart()

  chartItems: {title: string, data:  ChartConfiguration<'doughnut'>['data']}[] = [];
  summaryData: SummaryCardModel[] = [];
  rankingCards: RankingProjectModel[] = [];
  dataChart: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  constructor(
    protected fb: FormBuilder,
    protected apiService: ApiService,
    private selectValuesService: SelectValuesService,
    protected router: Router,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected authoritiesService: AuthoritiesService
  ) {
    super(
      router,
      apiService,
      utilsService,
      uiStateService,
      translateService,
      injector,
      activatedRoute,
      authoritiesService,
      fb.group({})
    );
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.moduleName = this.configForm.name as string;
    this.searchForm = this.fb.group(
      this.configForm.filterForm!.reduce((result: any, item) => {
        result[item.name] = item.validate;
        return result;
      }, {})
    );
  }


  async ngOnInit() {
    await this.loadProjectTeamData();
    await this.loadSpendingData();
    await this.loadCompanyData();
    await this.loadProjectData();
    this.loadDashboardTabs();
    this.loadAllOverviewData();
  }

  /**
   * Load data cho combobox project từ API
   */
  async loadProjectData() {
    try {
      this.projectValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/project/project`)
      );
    } catch (error) {
      this.projectTeamValues = [];
    }
  }

  /**
   * Load data cho combobox spending từ API
   */
  async loadSpendingData() {
    try {
      this.spendingValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/target`)
      );
    } catch (error) {
      this.spendingValues = [];
    }
  }

  /**
   * Load data cho combobox company từ API với filter orgType=COMPANY
   */
  async loadCompanyData() {
    try {
      this.companyValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/organization`,
          [{key: 'orgType', value: 'COMPANY'}]
        )
      );
    } catch (error) {
      this.companyValues = [];
    }
  }

  /**
   * Load data cho combobox projectTeam từ API
   */
  async loadProjectTeamData() {
    try {
      this.projectTeamValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(`${environment.PATH_API_V1}/mdm/project-type`)
      );
    } catch (error) {
      this.projectValues = [];
    }
  }

  /**
   * Lấy filter params từ form
   */
  private getFilterParams() {
    return this.searchForm.value;
  }

  /**
   * Tạo HttpParams từ filter object
   */
  private buildHttpParams(filters: any): HttpParams {
    let params = new HttpParams();

    if (filters.projectTeam) {
      params = params.set('projectTypeId', filters.projectTeam);
    }
    if (filters.spending) {
      params = params.set('targetId', filters.spending);
    }
    if (filters.project) {
      params = params.set('projectId', filters.project);
    }
    if (filters.company) {
      params = params.set('organizationId', filters.company);
    }

    return params;
  }

  /**
   Load tất cả dữ liệu overview với filter hiện tại
   */
  loadAllOverviewData() {
    this.isLoadingOverview = true;
    const filters = this.getFilterParams();
    const params = this.buildHttpParams(filters);

    forkJoin({
      summaryCards: this.apiService.get<SummaryCardModel[]>(
        `${environment.PATH_API_V1}/dashboard/overall/cards`,
        params
      ).pipe(
        catchError(error => {
          return of(null);
        })
      ),
      doughnutCharts: this.apiService.get<ChartConfiguration['data'][]>(
        `${environment.PATH_API_V1}/dashboard/overall/doughnuts`,
        params
      ).pipe(
        catchError(error => {
          return of(null);
        })
      ),

      stackedBarLine: this.apiService.get<ChartConfiguration['data']>(
        `${environment.PATH_API_V1}/dashboard/overall/chart`,
        params
      ).pipe(
        catchError(error => {
          return of(null);
        })
      ),

      rankingCards: this.apiService.get<RankingCardModel[]>(
        `${environment.PATH_API_V1}/dashboard/overall/ranking-table`,
        params
      ).pipe(
        catchError(error => {
          return of(null);
        })
      )

    }).subscribe({
      next: (results) => {
        if (results.summaryCards && results.summaryCards.length > 0) {
          this.summaryData = results.summaryCards
        } else {
          this.summaryData = [];
        }
        // Xử lý doughnut charts
        if (results.doughnutCharts) {
          const rawData : any = results.doughnutCharts  ;
          this.chartItems = Object.keys(rawData).map(key => ({
            title: key,
            data: rawData[key] as ChartConfiguration<'doughnut'>['data']
          }));
        } else {
          this.chartItems = [];
        }
        // Xử lý bar/line chart
        if (results.stackedBarLine) {
          this.dataChart = results.stackedBarLine;
        } else {
          this.dataChart = {
            labels: [],
            datasets: []
          };
        }

        // Xử lý ranking cards
        if (results.rankingCards && results.rankingCards.length > 0) {
          this.rankingCards = results.rankingCards;
        } else {
          this.rankingCards = [];
        }
        this.isLoadingOverview = false;

        setTimeout(() => {
          this.initOverviewCharts();
        }, 100);

      },
      error: (error) => {
        this.isLoadingOverview = false;
        setTimeout(() => {
          this.initOverviewCharts();
        }, 100);
      }
    });
  }

  loadDashboardTabs() {
    let params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', '10');

    this.apiService.get<TablePagingResponseModel>(
      `${environment.PATH_API_V1}/dashboard/dashboard-tab-config`,
      params
    ).pipe(
      catchError(error => {
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.content && response.content.length > 0) {
          this.tabs = response.content;
        } else {
          this.tabs = [];
        }
      },
      error: (error) => {
        this.tabs = [];
      }
    });
  }

  onFilterApply() {
    this.loadAllOverviewData()
  }

  onResetFilter() {
    this.resetSearchFormValue()
    this.loadAllOverviewData()
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    if (index > 0 && index <= this.tabs.length) {
      const tabId = this.tabs[index - 1].id;
      if (tabId !== undefined && tabId !== null && !this.loadedTabs.has(tabId)) {
        this.loadedTabs.add(tabId);
      }
    }
  }

  initOverviewCharts(): void {
    if (this.overViewCharBarLine) {
      this.overViewCharBarLine.destroy()
    }
    if (this.doughnutCharts) {
      this.doughnutCharts.forEach(chart => chart.destroy());
    }
    const canvasRevenueExpenseDisbursement = document.getElementById('canvas-revenue-expense-disbursement') as HTMLCanvasElement;
    if (canvasRevenueExpenseDisbursement) {
      const ctx: any = canvasRevenueExpenseDisbursement.getContext('2d');
      this.overViewCharBarLine = new Chart(ctx, {
        type: 'bar',
        data: this.dataChart,
        options: ChartOptionsUtils.stackBarChartOptions,
        plugins: [this.showLabel]
      })
    }
    this.chartItems.forEach((item, index) => {
      const canvasDoughnutChart = document.getElementById(`doughnutChart${index}`) as HTMLCanvasElement;
      if (canvasDoughnutChart) {
        const ctx: any = canvasDoughnutChart.getContext('2d');

        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: item.data as ChartConfiguration<'doughnut'>['data'],
          options: DEFAULT_CONFIG_CHART,
          plugins: [this.arrowLabel]
        });
        this.doughnutCharts.push(chart);
      }
    });
  }

  protected readonly environment = environment;
}
