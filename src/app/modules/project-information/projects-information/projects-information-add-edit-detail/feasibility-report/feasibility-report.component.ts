import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  DateUtilService, SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { FormBuilder, FormGroup } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {environment} from 'src/environments/environment';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import { TaxModel } from 'src/app/modules/mdm/_models/tax.model';
import { Utils } from 'src/app/shared/utils/utils';
import {ProjectItemSearchComponent} from "src/app/shared/components/project-item-search/project-item-search.component";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {FrequencyEnum} from "src/app/shared/enums/frequency.enum";

@Component({
  selector: 'vtp-feasibility-report',
  standalone: false,
  templateUrl: './feasibility-report.component.html',
})
export class FeasibilityReportComponent extends BaseAddEditComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() addEditForm: FormGroup;
  @ViewChild('itemSearchRef') itemSearchRef!: ProjectItemSearchComponent;
  moduleName = 'mdm.feasibility-report';
  model: TaxModel | null = null;
  isView = false;
  isFirstLoad: boolean = true;
  frequencyValues: SelectModel[] = [];


  checkIsActive!: boolean;

  protected readonly Utils = Utils;
  formAdvanceSearch?: FormGroup;
  protected readonly environment = environment;
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected dateUtilService: DateUtilService,
    protected selectService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.addEditForm = this.fb.group({
    });
  }


  async ngOnInit() {
    super.ngOnInit();
    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
  }

  ngAfterViewInit(): void {
    this.checkAndLoadTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemSearchRef && !this.btnApplyDisabled && this.isFirstLoad) {
      this.checkAndLoadTable();
    }
  }

  private checkAndLoadTable(): void {
    if (this.itemSearchRef && !this.btnApplyDisabled && this.isFirstLoad) {
      const expressionId = this.addEditForm.value.expressionFeasibilityReportId;
      if (expressionId) {
        this.itemSearchRef.onLoadTable(expressionId);
        this.isFirstLoad = false;
      }
    }
  }

  get btnApplyDisabled(): boolean {
    return (
      !this.addEditForm.value.expressionFeasibilityReportId ||
      !this.addEditForm.value.frequencyFeasibilityReport ||
      !this.addEditForm.value.startDateFeasibilityReport ||
      !this.addEditForm.value.endDateFeasibilityReport
    );
  }
}
