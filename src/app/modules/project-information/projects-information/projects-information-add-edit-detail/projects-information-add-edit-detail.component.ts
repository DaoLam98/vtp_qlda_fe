import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {
  AlignEnum,
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ColumnModel, ColumnTypeEnum, IconTypeEnum, SelectModel,
  UtilsService
} from "@c10t/nice-component-library";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {Utils} from 'src/app/shared/utils/utils';
import {PermissionCheckingUtil} from "src/app/shared/utils/permission-checking.util";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SelectValuesService} from "src/app/core/services/selectValues.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {Location} from '@angular/common';
import {environment} from "src/environments/environment";
import {ProjectDetailModel} from "src/app/modules/project-information/models/projects-information.model";
import {firstValueFrom, lastValueFrom, Observable, of} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {OrganizationModel} from "src/app/modules/mdm/_models/organization.model";
import {ActionTypeEnum} from "src/app/shared";
import {DEFAULT_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-projects-information-add-edit-detail',
  standalone: false,
  templateUrl: './projects-information-add-edit-detail.component.html',
  styleUrls: ['./projects-information-add-edit-detail.component.scss']
})
export class ProjectsInformationAddEditDetailComponent extends BaseAddEditComponent implements OnInit {
  @ViewChild('matTabGroup') matTabGroup!: MatTabGroup;
  Utils = Utils;
  moduleName: string = 'project.project';
  columns: ColumnModel[] = [];
  model: ProjectDetailModel | null = null;
  statusValues: SelectModel[] = [
    {
      displayValue: this.translateService.instant('common.project.status.doing'),
      value: 'APPROVED',
      rawData: 'APPROVED',
      disabled: false
    },
    {
      displayValue: this.translateService.instant('common.project.status.closed'),
      value: 'REJECTED',
      rawData: 'REJECTED',
      disabled: false
    }
  ];
  isEdited: boolean = false;
  totalInvestmentCapitalDisplay: any;
  assetValues: SelectModel[] = [];
  targetValues: SelectModel[] = [];
  accountingAccountValues: SelectModel[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected router: Router,
    protected selectValuesService: SelectValuesService,
    protected route: ActivatedRoute,
    protected matDialog: MatDialog,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected cdr: ChangeDetectorRef,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    this.addEditForm = this.fb.group({
      id: [''],
      code: [''],
      name: [''],
      sapCode: ['', [Validators.pattern(DEFAULT_REGEX)]],
      projectTypeName: [''],
      proposal: [''],
      proposingOrgName: [''],
      operatingOrgName: [''],
      expectedStartDate: [null],
      expectedEndDate: [null],
      status: [''],
      scale: [''],
      address: [''],
      goal: [''],
      locationName: [''],
      createdBy: [''],
      createdDate: [null],
      lastModifiedBy: [''],
      lastModifiedDate: [null],
      organizations: [[]],
      projectProposals: [],
      totalInvestmentCapital: [],

      // Thông tin đầu tư và khả thi
      investorOrgId: [''],
      investorOrgCode: [''],
      investorOrgName: [''],
      investmentFormId: [''],
      investmentFormCode: [''],
      investmentFormName: [''],
      investmentCapitalSource: [''],
      expressionInvestmentId: [''],
      expressionInvestmentCode: [''],
      expressionInvestmentName: [''],
      expressionFeasibilityReportId: [''],
      expressionFeasibilityReportCode: [''],
      expressionFeasibilityReportName: [''],
      startDateInvestment: [''],
      endDateInvestment: [''],
      startDateFeasibilityReport: [''],
      endDateFeasibilityReport: [''],
      informationTypeInvestmentId: [''],
      informationTypeInvestmentCode: [''],
      informationTypeInvestmentName: [''],
      informationTypeFeasibilityReportId: [''],
      informationTypeFeasibilityReportCode: [''],
      informationTypeFeasibilityReportName: [''],
      frequencyInvestment: [''],
      frequencyFeasibilityReport: [''],
      currencyName: [''],
      currencyId: [''],
      currencyCode: [''],
      isUpdated: [],
    });

    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  async ngOnInit() {
    super.ngOnInit();
    await this.onGetData();
    if (this.isEdit) {
      this.model = await firstValueFrom(
        this.apiService.get<ProjectDetailModel>(`${environment.PATH_API_V1}/project/project/` + this.id, new HttpParams())
      );

      this.isEdited = this.model.isUpdated
      this.addEditForm.patchValue(this.model);
      this.totalInvestmentCapitalDisplay = this.model.totalInvestmentCapital
        ? Utils.formatCurrencyWithComma(Number(this.model.totalInvestmentCapital))
        : '';
      this.setLatestProposalDisplay();
    }
    this.initOrgColumns();
    this.setLatestProposalDisplay();

  }

  private initOrgColumns(): void {
    this.columns.push(
      {
        columnDef: 'stt',
        header: 'stt',
        headerClassName: 'mat-column-stt width-5 min-width-40',
        className: 'mat-column-stt',
        title: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        cell: (e: OrganizationModel) => {
          const values = this.addEditForm.get('organizations')?.value as OrganizationModel[];
          const index = values.indexOf(e) + 1;
          return index.toString();
        },
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.CENTER,
      },
      {
        columnDef: 'organizationName',
        header: 'name',
        className: 'mat-column-name',
        title: (e: OrganizationModel) => `${e.organizationName || ''}`,
        cell: (e: OrganizationModel) => `${e.organizationName || ''}`,
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
      {
        columnDef: 'organizationDescription',
        header: 'description',
        title: (e: OrganizationModel) => `${e.organizationDescription || ''}`,
        cell: (e: OrganizationModel) => `${e.organizationDescription || ''}`,
        className: 'mat-column-form',
        columnType: ColumnTypeEnum.VIEW,
        alignHeader: AlignEnum.CENTER,
        align: AlignEnum.LEFT,
      },
    );
  }


  onSave() {
    const totalCapital = this.addEditForm.get('totalInvestmentCapital')?.value;
    if (totalCapital && typeof totalCapital === 'string' && totalCapital.includes(',')) {
      const numericValue = totalCapital.replace(/,/g, '');
      this.addEditForm.get('totalInvestmentCapital')?.setValue(numericValue, {emitEvent: false});
    }

    const formData = new FormData();
    const payload = new ProjectDetailModel(this.addEditForm);
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/project/project/${this.id}`, formData);

    this.utilsService.execute(apiCall, this.onSuccessFunc,
      `common.edit.success`,
      `common.confirm.edit`, ['project.']);
  }

  onEdit(item: any) {
    this.router.navigate([`/project/projects-info/edit`, item]);
  }

  onChangeTab(event: MatTabChangeEvent) {
  }

  private setLatestProposalDisplay(): void {
    const proposals: any[] = this.addEditForm.get('projectProposals')?.value || [];
    if (!Array.isArray(proposals) || proposals.length === 0) return;

    const latest = proposals.reduce((latest: any, current: any) => {
      const latestTime = latest?.createdDate ? new Date(latest.createdDate).getTime() : -Infinity;
      const currentTime = current?.createdDate ? new Date(current.createdDate).getTime() : -Infinity;
      return currentTime > latestTime ? current : latest;
    }, proposals[0]);

    const displayValue = `(${latest?.code ?? ''}) ${latest?.name ?? ''}`
    this.addEditForm.get('proposal')?.setValue(displayValue);
  }

  async onGetData() {
    [
      this.assetValues,
      this.accountingAccountValues,
      this.targetValues
    ] = await Promise.all([
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/asset`,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/accounting-account`,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      ),
      lastValueFrom(
        this.selectValuesService.getAutocompleteValuesFromModulePath(
          `${environment.PATH_API_V1}/mdm/target`,
          undefined,
          undefined,
          undefined,
          true,
          undefined,
          this.isEdit,
        ),
      )
    ])
  }

  protected readonly environment = environment;
}
