import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ActionTypeEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  DateUtilService,
  NumericInputFormat,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { ProjectItemSearchComponent } from 'src/app/shared/components/project-item-search/project-item-search.component';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ProjectProposalModel } from '../../../models/project-proposal.model';
import { FORM_CONFIG } from '../../project-proposal-search/project-proposal-search.config';

@Component({
  selector: 'app-project-proposal-investment',
  templateUrl: './project-proposal-investment.component.html',
  styleUrl: './project-proposal-investment.component.scss',
  standalone: false,
})
export class ProjectProposalInvestmentComponent extends BaseAddEditComponent implements OnChanges {
  @Input() model!: ProjectProposalModel;
  @Input() addEditForm!: FormGroup;
  @Input() organizationValues: SelectModel[] = [];
  @Input() investmentFormValues: SelectModel[] = [];
  @Input() expressionValues: SelectModel[] = [];
  @Input() informationTypeValues: SelectModel[] = [];
  @Input() frequencyValues: SelectModel[] = [];
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];
  @Input() currencyValues: SelectModel[] = [];
  @Output() isEmptyTabExists = new EventEmitter<boolean>(false);
  @Output() onExpressionChange = new EventEmitter<void>();
  @ViewChild('itemSearchRef') itemSearchRef!: ProjectItemSearchComponent;
  configForm: Config;
  organizationValuesCopy: SelectModel[] = [];
  investmentFormValuesCopy: SelectModel[] = [];
  expressionValuesCopy: SelectModel[] = [];
  informationTypeValuesCopy: SelectModel[] = [];
  currencyValuesCopy: SelectModel[] = [];

  protected readonly Utils = Utils;
  protected readonly environment = environment;
  isFirstLoad: boolean = true;
  formatFun = new NumericInputFormat();
  errorMessages: Map<string, () => string> = new Map([
    ['startDateAfterEndDate', () => 'project.project-proposal.error.startDateAfterEndDate'],
  ]);

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
    this.configForm = FORM_CONFIG;
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model?.isApplyInvestment && this.isFirstLoad) {
      this.itemSearchRef.onLoadTable(this.addEditForm.value.expressionInvestmentId);
      this.isFirstLoad = false;
    }
    this.organizationValuesCopy = [
      ...this.organizationValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.investorOrgId,
      ),
    ];
    this.investmentFormValuesCopy = [
      ...this.investmentFormValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.investmentFormId,
      ),
    ];
    this.expressionValuesCopy = [
      ...this.expressionValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.expressionInvestmentId,
      ),
    ];
    this.informationTypeValuesCopy = [
      ...this.informationTypeValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.informationTypeInvestmentId,
      ),
    ];
    this.currencyValuesCopy = [
      ...this.currencyValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.currencyId,
      ),
    ];
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.addEditForm.get('investorOrgId')?.valueChanges.subscribe((res) => {
      const value = this.organizationValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          investorOrgName: value.name || null,
        });
      }
    });

    this.addEditForm.get('investmentFormId')?.valueChanges.subscribe((res) => {
      const value = this.investmentFormValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          investmentFormName: value.name || null,
        });
      }
    });

    this.addEditForm.get('currencyId')?.valueChanges.subscribe((res) => {
      const value = this.currencyValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          currencyName: value.name || null,
        });
      }
    });

    this.addEditForm.get('expressionInvestmentId')?.valueChanges.subscribe((res) => {
      const value = this.expressionValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          expressionInvestmentName: value.name || null,
        });
      }
    });

    this.addEditForm.get('informationTypeInvestmentId')?.valueChanges.subscribe((res) => {
      const value = this.informationTypeValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          informationTypeInvestmentName: value.name || null,
        });
      }
    });
  }

  onApply() {
    const formData = new FormData();
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project-proposal/${this.id}`, formData);
    const payload: ProjectProposalModel = {
      ...this.model,
      expressionInvestmentId: this.addEditForm.value.expressionInvestmentId,
      expressionInvestmentName: this.addEditForm.value.expressionInvestmentName,
      frequencyInvestment: this.addEditForm.value.frequencyInvestment,
      startDateInvestment: this.addEditForm.value.startDateInvestment,
      endDateInvestment: this.addEditForm.value.endDateInvestment,
      validateActionType: 'APPLY_INVESTMENT',
      isApplyInvestment: true,
    };
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.itemSearchRef.onLoadTable(
          this.addEditForm.value.expressionInvestmentId,
          true,
          this.addEditForm.value.startDateInvestment,
          this.addEditForm.value.endDateInvestment,
          this.addEditForm.value.frequencyInvestment,
        );
        this.onExpressionChange.emit();
      },
      `common.edit.success`,
      '',
    );
  }

  onReset() {
    const formData = new FormData();
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project-proposal/${this.id}`, formData);
    const payload: ProjectProposalModel = {
      ...this.model,
      validateActionType: 'APPLY_INVESTMENT',
      isApplyInvestment: false,
    };
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.onExpressionChange.emit();
      },
      `common.edit.success`,
      'common.title.confirm',
      undefined,
      'mdm.project-proposal.expression-change',
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }

  get btnApplyDisabled(): boolean {
    return (
      !this.addEditForm.value.expressionInvestmentId ||
      !this.addEditForm.value.frequencyInvestment ||
      !this.addEditForm.value.startDateInvestment ||
      !this.addEditForm.value.endDateInvestment
    );
  }
}
