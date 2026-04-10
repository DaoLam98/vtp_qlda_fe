import {AfterViewInit, Component, Injector, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseSearchComponent,
  ColumnModel,
  RangeDatePickerModel,
  FormStateService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import {FormBuilder} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTabChangeEvent} from '@angular/material/tabs';
import Chart from 'chart.js/auto';
import { HttpParams } from '@angular/common/http';
import { DashboardSosTrackingBottom, DashboardSosTrackingBottomLeft, DashboardSosTrackingBottomRight, DashboardSosTrackingCenter, DashboardSosTrackingLeft } from 'src/app/core';
import { ChartOptionsUtils } from 'src/app/shared/utils/ChartOptionsUtils';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class DashboardComponent extends BaseSearchComponent implements OnInit {

  moduleName = 'dashboard';

  tabIndex = 0;
  overviewStackedBarChart: any;
  overviewBarLineChart: any;
  advanceFunnelChart: any;

  statusOrdersColumns: ColumnModel[] = [];
  statusOrdersUniqueUserColumns: ColumnModel[] = [];
  scoreCard: DashboardSosTrackingLeft = new DashboardSosTrackingLeft();

  groupByTypeOptions: SelectModel[] = [];
  isReady = false;

  constructor(protected formBuilder: FormBuilder,
              protected router: Router,
              protected apiService: ApiService,
              protected utilsService: UtilsService,
              protected uiStateService: FormStateService,
              protected translateService: TranslateService,
              protected injector: Injector,
              protected activatedRoute: ActivatedRoute,
              public matDialog: MatDialog,
              protected authoritiesService: AuthoritiesService) {
    super(router, apiService, utilsService, uiStateService, translateService, injector, activatedRoute, authoritiesService,
      formBuilder.group({
        rangeDate: [''],
        rangeFromDate: [''],
        rangeToDate: [''],
        groupByType: ['_DATE'],
        statusOrders: [[]],
        statusOrdersUniqueUser: [[]]
      }));
    this.statusOrdersColumns.push(...[
      {
        columnDef: 'ordinalNumber', header: 'ordinalNumber',
        title: (e: DashboardSosTrackingBottomLeft) => `${e.ordinalNumber}`,
        cell: (e: DashboardSosTrackingBottomLeft) => `${e.ordinalNumber}`,
        className: 'mat-column-ordinalNumber',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomLeft) => true,
      },
      {
        columnDef: 'title', header: 'title',
        title: (e: DashboardSosTrackingBottomLeft) => `${e.title}`,
        cell: (e: DashboardSosTrackingBottomLeft) => `${e.title}`,
        className: 'mat-column-title',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomLeft) => true,
      },
      {
        columnDef: 'total', header: 'total',
        title: (e: DashboardSosTrackingBottomLeft) => `${e.total}`,
        cell: (e: DashboardSosTrackingBottomLeft) => `${e.total}`,
        className: 'mat-column-total',
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
        isShowHeader: true, display: (e: DashboardSosTrackingBottomLeft) => true,
      },
    ]);
    this.statusOrdersUniqueUserColumns.push(...[
      {
        columnDef: 'customerPhone', header: 'customerPhone',
        title: (e: DashboardSosTrackingBottomRight) => `${e.customerPhone}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.customerPhone}`,
        className: 'mat-column-customerPhone',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
      },
      {
        columnDef: 'amountCustomerClick', header: 'amountCustomerClick',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerClick}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerClick}`,
        className: 'mat-column-amountCustomerClick',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
      {
        columnDef: 'amountCustomerRequested', header: 'amountCustomerRequested',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerRequested}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerRequested}`,
        className: 'mat-column-amountCustomerRequested',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
      {
        columnDef: 'amountRequestedGarage', header: 'amountRequestedGarage',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountRequestedGarage}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountRequestedGarage}`,
        className: 'mat-column-amountRequestedGarage',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
      {
        columnDef: 'amountConfirmCustomer', header: 'amountConfirmCustomer',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountConfirmCustomer}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountConfirmCustomer}`,
        className: 'mat-column-amountConfirmCustomer',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
      {
        columnDef: 'amountCustomerCancel', header: 'amountCustomerCancel',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerCancel}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountCustomerCancel}`,
        className: 'mat-column-amountCustomerCancel',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
      {
        columnDef: 'amountGarageReject', header: 'amountGarageReject',
        title: (e: DashboardSosTrackingBottomRight) => `${e.amountGarageReject}`,
        cell: (e: DashboardSosTrackingBottomRight) => `${e.amountGarageReject}`,
        className: 'mat-column-amountGarageReject',
        isShowHeader: true, display: (e: DashboardSosTrackingBottomRight) => true,
        align: AlignEnum.CENTER
      },
    ]);
  }

  ngOnInit() {
    const toDate = new Date();
    const fromDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
    const dateRangePickerModel = new RangeDatePickerModel();
    dateRangePickerModel.fromDate = fromDate;
    dateRangePickerModel.toDate = toDate;
    this.searchForm.get('rangeDate')?.setValue(dateRangePickerModel);
  }

  onRangeDateChange(event: any) {
    const changeEvent = new MatTabChangeEvent();
    changeEvent.index = this.tabIndex;
    this.onTabChanged(changeEvent);
  }

  tabChange(tabIndex: number) {
    this.tabIndex = tabIndex;
  }

  onTabChanged(changeEvent: MatTabChangeEvent) {
  }

  loadOverviewTab() {
    if (this.overviewStackedBarChart) {
      this.overviewStackedBarChart.destroy();
    }
    if (this.overviewBarLineChart) {
      this.overviewBarLineChart.destroy();
    }
    const canvasOverviewStackedBar: any = document.getElementById('canvas-overview-stacked-bar');
    const canvasOverviewBarLine: any = document.getElementById('canvas-overview-bar-line');
    const params = new HttpParams()
      .set('groupByType', this.searchForm.get('groupByType')?.value.replace('_', ''))
      .set('fromDate', this.searchForm.get('rangeFromDate')?.value)
      .set('toDate', this.searchForm.get('rangeToDate')?.value);
    this.apiService.get<DashboardSosTrackingCenter>('/sos-tracking/get-information-chart', params)
      .subscribe(res => {
        this.isReady = true;
        if (canvasOverviewStackedBar) {
          const ctx: any = canvasOverviewStackedBar.getContext('2d');
          this.overviewStackedBarChart = new Chart(ctx, {
            type: 'bar',
            data: res.sosTrackingClickCallCharts,
            options: ChartOptionsUtils.stackBarChartOptions
          });
        }
        if (canvasOverviewBarLine) {
          const ctx: any = canvasOverviewBarLine.getContext('2d');
          this.overviewBarLineChart = new Chart(ctx, {
            type: 'bar',
            data: res.sosTrackingClickAndCustomerCharts,
            options: ChartOptionsUtils.barChartOptions
          });
        }
      });
    this.apiService.get<DashboardSosTrackingLeft>('/sos-tracking/number-click', params)
      .subscribe(res => {
        this.scoreCard = res;
      });
  }

  loadDetailTab() {
    const params = new HttpParams()
      .set('fromDate', this.searchForm.get('rangeFromDate')?.value)
      .set('toDate', this.searchForm.get('rangeToDate')?.value);
    this.apiService.get<DashboardSosTrackingBottom>('/sos-tracking/order-status-search', params)
      .subscribe(res => {
        this.searchForm.get('statusOrders')?.setValue(res.totalDetailOrderStatus);
        this.searchForm.get('statusOrdersUniqueUser')?.setValue(res.detailtOrderStatusDtos);
      });
  }

  loadAvanceTab() {
    if (this.advanceFunnelChart) {
      this.advanceFunnelChart.destroy();
    }
    const params = new HttpParams()
      .set('fromDate', this.searchForm.get('rangeFromDate')?.value)
      .set('toDate', this.searchForm.get('rangeToDate')?.value);
    this.apiService.get<DashboardSosTrackingLeft>('/sos-tracking/number-click', params)
      .subscribe(() => {});
  }

  onGroupByTypeChange($event: any) {
  }
}
