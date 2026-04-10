import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ApiService,
  AuthoritiesService, BaseAddEditComponent,
  BaseSearchComponent, DateUtilService,
  SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProjectItemSearchComponent} from "src/app/shared/components/project-item-search/project-item-search.component";
import {Config} from "src/app/common/models/config.model";
import {Utils} from 'src/app/shared/utils/utils';
import {environment} from 'src/environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {
  FORM_CONFIG_CAPITAL,
  FORM_CONFIG_TOTAL
} from "src/app/modules/project-information/projects-information/projects-information-add-edit-detail/investment-information/investment-information.config";
import {EnumUtil} from "src/app/shared/utils/enum.util";
import {FrequencyEnum} from "src/app/shared/enums/frequency.enum";
@Component({
  selector: 'app-project-evaluation-investment',
  templateUrl: './project-evaluation-investment.component.html',
  styleUrl: './project-evaluation-investment.component.scss',
  standalone: false,
})
export class ProjectEvaluationInvestmentComponent extends BaseAddEditComponent implements OnInit, OnChanges, AfterViewInit{
  @Input() addEditForm!: FormGroup;
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];
  @Output() isEmptyTabExists = new EventEmitter<boolean>(false);
  @ViewChild('itemSearchRef') itemSearchRef!: ProjectItemSearchComponent;

  moduleName = 'mdm.investment';
  configFormTotal: Config;
  configFormCapital: Config;
  formAdvanceSearch?: FormGroup;
  isFirstLoad: boolean = true;
  frequencyValues: SelectModel[] = [];

  protected readonly Utils = Utils;
  protected readonly environment = environment;

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
    protected cdr: ChangeDetectorRef,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configFormTotal = JSON.parse(JSON.stringify(FORM_CONFIG_TOTAL));
    this.configFormCapital = JSON.parse(JSON.stringify(FORM_CONFIG_CAPITAL));

    this.addEditForm = this.fb.group({});
  }

  async ngOnInit() {
    super.ngOnInit();
    EnumUtil.enum2SelectModel(FrequencyEnum, this.frequencyValues, 'EDIT');
    this.formatTotalInvestmentCapitalForDisplay();
    this.subscribeToFormChanges();
  }

  private subscribeToFormChanges(): void {
    this.addEditForm.get('expressionInvestmentId')?.valueChanges.subscribe(() => {
      this.isFirstLoad = true;
      setTimeout(() => this.checkAndLoadTable(), 100);
    });
  }

  ngAfterViewInit(): void {
    this.checkAndLoadTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['addEditForm'] && this.addEditForm) {
      this.formatTotalInvestmentCapitalForDisplay();
    }

    if (this.itemSearchRef && !this.btnApplyDisabled && this.isFirstLoad) {
      this.checkAndLoadTable();
    }
  }

  private checkAndLoadTable(): void {
    this.formatTotalInvestmentCapitalForDisplay();
    if (this.itemSearchRef && !this.btnApplyDisabled && this.isFirstLoad) {
      const expressionId = this.addEditForm.value.expressionInvestmentId;
      if (expressionId) {
        this.itemSearchRef.onLoadTable(expressionId);
        this.isFirstLoad = false;
      }
    }
  }

  get btnApplyDisabled(): boolean {
    return (
      !this.addEditForm.value.expressionInvestmentId ||
      !this.addEditForm.value.frequencyInvestment ||
      !this.addEditForm.value.startDateInvestment ||
      !this.addEditForm.value.endDateInvestment
    );
  }

  formatTotalInvestmentCapitalForDisplay() {
    const value = this.addEditForm.get('totalInvestmentCapital')?.value;
    if (!value) return;

    if (typeof value === 'number' || (typeof value === 'string' && !value.includes(','))) {
      const numValue = Number(typeof value === 'string' ? value.replace(/,/g, '') : value);
      if (!isNaN(numValue)) {
        const formattedValue = Utils.formatCurrencyWithComma(numValue);
        this.addEditForm.get('totalInvestmentCapital')?.setValue(formattedValue, {emitEvent: false});
      }
    }
  }
}
