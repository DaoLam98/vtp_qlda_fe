import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, DateUtilService,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Config } from 'src/app/common/models/config.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import {Utils} from 'src/app/shared/utils/utils';
import { lastValueFrom } from 'rxjs';
import { ProjectEvaluationModel } from '../../../models/project-evaluation.model';
import { ImplStatusEffectivenessTableComponent } from '../impl-status-effectiveness-table/impl-status-effectiveness-table.component';
import { FORM_CONFIG } from './project-evaluatuib-impl-status.config';

@Component({
  selector: 'app-project-evaluation-impl-status',
  templateUrl: './project-evaluation-impl-status.component.html',
  styleUrl: './project-evaluation-impl-status.component.scss',
  standalone: false,
})
export class ProjectImplStatusComponent  extends BaseAddEditComponent implements OnInit, OnChanges {
  @Input() model!: ProjectEvaluationModel;
  @Input() addEditForm!: FormGroup;
  @Input() assetValues: SelectModel[] = [];
  @Input() accountingAccountValues: SelectModel[] = [];
  @Input() targetValues: SelectModel[] = [];
  @Output() onExpressionChange = new EventEmitter<void>();
  @Output() isEmptyTabExists = new EventEmitter<boolean>(false);
  @ViewChild('itemSearchRef') itemSearchRef!: ImplStatusEffectivenessTableComponent;
  moduleName = 'project.project-evaluation';
  configForm: Config;
  formAdvanceSearch?: FormGroup;
  expressionValues: SelectModel[] = [];
  isFirstLoad = true;
  protected readonly Utils = Utils;
  protected readonly environment = environment;
  errorMessages: Map<string, () => string> = new Map([
    ['startDateAfterEndDate', () => 'project.project-proposal.error.startDateAfterEndDate'],
  ]);

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
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected cdr: ChangeDetectorRef,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
  }


  async ngOnInit() {
    super.ngOnInit();
    this.expressionValues = await lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
            `${environment.PATH_API_V1}/mdm/expression`,
            undefined,
            undefined,
            undefined,
            true,
        )
    )

    this.addEditForm.get('implStatusExpressionId')?.valueChanges.subscribe((res) => {
      const value = this.expressionValues.find((item) => item.value === res)?.rawData;
      if (value) {
        this.addEditForm.patchValue({
          implStatusExpressionName: value.name || null,
          implStatusExpressionCode: value.code || null,
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.model?.isApplyImplStatus && this.isFirstLoad) {
      this.itemSearchRef.onLoadTable(this.addEditForm.value.implStatusExpressionId);
      this.isFirstLoad = false;
    }
  }

  onApply() {
    const formData = new FormData();
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project-evaluation/${this.id}`, formData);
    const payload = {
      ...this.model,
      implStatusExpressionId: this.addEditForm.value.implStatusExpressionId,
      implStatusExpressionName: this.addEditForm.value.implStatusExpressionName,
      implStatusExpressionCode: this.addEditForm.value.implStatusExpressionCode,
      implStatusStartDate: this.addEditForm.value.implStatusStartDate,
      implStatusEndDate: this.addEditForm.value.implStatusEndDate,
      projectEvalActionType: 'APPLY_IMPL_STATUS',
      isApplyImplStatus: true,
    };
    formData.append('body', this.utilsService.toBlobJon(payload));

    this.utilsService.execute(
        apiCall,
        (data, message) => {
          this.itemSearchRef.onLoadTable(
              this.addEditForm.value.implStatusExpressionId,
              true,
          );
          this.onExpressionChange.emit();
        },
        `common.edit.success`,
        '',
    );
  }

  onReset() {
    const formData = new FormData();
    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project-evaluation/${this.id}`, formData);
    const payload = {
      ...this.model,
      validateActionType: 'APPLY_IMPL_STATUS',
      isApplyImplStatus: false,
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
      !this.addEditForm.value.implStatusExpressionId ||
      !this.addEditForm.value.implStatusStartDate ||
      !this.addEditForm.value.implStatusEndDate
    );
  }
}
