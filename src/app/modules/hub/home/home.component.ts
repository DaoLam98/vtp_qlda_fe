import {AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PieController,
  PointElement,
  Title,
} from 'chart.js';
import {
  ApiService,
  AuthoritiesService,
  BaseSearchComponent,
  FormStateService,
  UtilsService
} from "@c10t/nice-component-library";
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog} from "@angular/material/dialog";
import {environment} from 'src/environments/environment';
import {ModuleModel} from 'src/app/core';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {HttpParams} from '@angular/common/http';

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, PieController,
  ArcElement, Title
);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent extends BaseSearchComponent implements OnInit, AfterViewInit {

  @ViewChild('lineChart') lineChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;
  @ViewChild('groupBarChart') groupBarChartRef!: ElementRef;
  @ViewChild('pieChart') pieChartRef!: ElementRef;

  modules: ModuleModel[] = [];

  tasks = [
    {
      category: 'Công tác phí',
      count: 2,
      items: [
        {
          title: 'Kế hoạch công tác phí tháng 2',
          description: 'Phê duyệt công tác phí'
        },
        {
          title: 'Kết thúc công tác Đà Nẵng',
          description: 'Khai báo thông tin'
        },
      ],
    },
    {
      category: 'Bếp',
      count: 2,
      items: [
        {
          title: 'Kế hoạch công tác phí tháng 3',
          description: 'Phê duyệt công tác phí'
        },
        {
          title: 'Kết thúc công tác Đà Nẵng',
          description: 'Khai báo thông tin'
        },
      ],
    },
    {
      category: 'Quản lý',
      count: 2,
      items: [
        {
          title: 'Kế hoạch công tác phí tháng 2',
          description: 'Phê duyệt công tác phí'
        },
        {
          title: 'Kết thúc công tác Đà Nẵng',
          description: 'Khai báo thông tin'
        },
      ],
    },
  ];

  constructor(
    protected formBuilder: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected uiStateService: FormStateService,
    protected translateService: TranslateService,
    protected injector: Injector,
    protected activatedRoute: ActivatedRoute,
    protected matDialog: MatDialog,
    protected authoritiesService: AuthoritiesService,
    protected selectValuesService: SelectValuesService,
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
      formBuilder.group({})
    );

    this.getModules();
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  getModules() {
    this.selectValuesService
      .getRawDataFromModulePath(`${environment.PATH_API_V1}/mdm/module`, [
        {
          key: 'selectedFields',
          value: 'id,code,name,icon,path,color,orderNumber'
        },
      ])
      .subscribe((modules: ModuleModel[]) => {
        this.modules = modules.filter((item) => item.path).sort(
          (a, b) => (a.orderNumber || Infinity) - (b.orderNumber || Infinity));
        for(const module of this.modules) {
          if(module.icon) {
            this.apiService
              .getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${module.icon}`, new HttpParams())
              .subscribe((res) => {
                const reader = new FileReader();
                reader.readAsDataURL(res);
                reader.onloadend = function() {
                  const base64data = reader.result as string;
                  module.img = base64data;
                };
              });
          }
        }
      });
  }

  initCharts() {
    if(!this.lineChartRef || !this.barChartRef || !this.groupBarChartRef || !this.pieChartRef) {
      console.error('Canvas elements not found!');
      return;
    }

  }
}
