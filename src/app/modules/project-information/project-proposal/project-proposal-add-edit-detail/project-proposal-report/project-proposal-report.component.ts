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
  selector: 'app-project-proposal-report',
  templateUrl: './project-proposal-report.component.html',
  styleUrl: './project-proposal-report.component.scss',
  standalone: false,
})
export class ProjectProposalReportComponent extends BaseAddEditComponent implements OnChanges {
  @Input() model!: ProjectProposalModel;
  @Input() addEditForm!: FormGroup;
  @Input() expressionValues: SelectModel[] = [];
  @Input() informationTypeValues: SelectModel[] = [];
  @Input() frequencyValues: SelectModel[] = [];
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];
  @Output() isEmptyTabExists = new EventEmitter<boolean>(false);
  @Output() onExpressionChange = new EventEmitter<void>();
  @ViewChild('itemSearchRef') itemSearchRef!: ProjectItemSearchComponent;
  configForm: Config;
  expressionValuesCopy: SelectModel[] = [];
  informationTypeValuesCopy: SelectModel[] = [];
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  isFirstLoad: boolean = true;
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
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model?.isApplyFeasibility && this.isFirstLoad) {
      this.itemSearchRef.onLoadTable(this.addEditForm.value.expressionFeasibilityReportId);
      this.isFirstLoad = false;
    }
    this.expressionValuesCopy = [
      ...this.expressionValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.expressionFeasibilityReportId,
      ),
    ];
    this.informationTypeValuesCopy = [
      ...this.informationTypeValues.filter(
        (item) => item.rawData.status == 'APPROVED' || item.value == this.model?.informationTypeFeasibilityReportId,
      ),
    ];
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.addEditForm.get('expressionFeasibilityReportId')?.valueChanges.subscribe((res) => {
      const value = this.expressionValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          expressionFeasibilityReportName: value.name || null,
        });
      }
    });

    this.addEditForm.get('informationTypeFeasibilityReportId')?.valueChanges.subscribe((res) => {
      const value = this.informationTypeValues.find((item) => item.value == res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          informationTypeFeasibilityReportName: value.name || null,
        });
      }
    });
  }

  onApply() {
    const formData = new FormData();
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project-proposal/${this.id}`, formData);
    const payload: ProjectProposalModel = {
      ...this.model,
      expressionFeasibilityReportId: this.addEditForm.value.expressionFeasibilityReportId,
      expressionFeasibilityReportName: this.addEditForm.value.expressionFeasibilityReportName,
      frequencyFeasibilityReport: this.addEditForm.value.frequencyFeasibilityReport,
      startDateFeasibilityReport: this.addEditForm.value.startDateFeasibilityReport,
      endDateFeasibilityReport: this.addEditForm.value.endDateFeasibilityReport,
      validateActionType: 'APPLY_FEASIBILITY_REPORT',
      isApplyFeasibility: true,
    };
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.itemSearchRef.onLoadTable(
          this.addEditForm.value.expressionFeasibilityReportId,
          true,
          this.addEditForm.value.startDateFeasibilityReport,
          this.addEditForm.value.endDateFeasibilityReport,
          this.addEditForm.value.frequencyFeasibilityReport,
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
      validateActionType: 'APPLY_FEASIBILITY_REPORT',
      isApplyFeasibility: false,
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
      !this.addEditForm.value.expressionFeasibilityReportId ||
      !this.addEditForm.value.frequencyFeasibilityReport ||
      !this.addEditForm.value.startDateFeasibilityReport ||
      !this.addEditForm.value.endDateFeasibilityReport
    );
  }
}
