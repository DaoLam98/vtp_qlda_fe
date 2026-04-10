import {ChangeDetectorRef, Component, Input, OnInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {HttpParams} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {lastValueFrom, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

import {environment} from 'src/environments/environment';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  ColumnModel,
  SelectModel,
  UtilsService,
  AlignEnum,
  ColumnTypeEnum
} from '@c10t/nice-component-library';
import {SelectValuesService} from 'src/app/core/services/selectValues.service';
import {PermissionCheckingUtil} from 'src/app/shared/utils/permission-checking.util';
import {ProjectDetailModel} from 'src/app/modules/project-information/models/projects-information.model';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-project-evaluation-general',
  templateUrl: './project-evaluation-general.component.html',
  styleUrl: './project-evaluation-general.component.scss',
  standalone: false,
})
export class ProjectEvaluationGeneralComponent extends BaseAddEditComponent implements OnInit, OnDestroy {
  @Input() addEditForm!: FormGroup;

  projectList: SelectModel[] = [];
  columns: ColumnModel[] = [];
  moduleName = 'project.project';
  isShowInformation: boolean = false;
  isLoadingProject = false;

  projectIdSubscription?: Subscription;

  private readonly PROJECT_API_PATH = `${environment.PATH_API_V1}/project/project`;
  private readonly DEBOUNCE_TIME_MS = 300;
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
    protected selectValuesService: SelectValuesService,
    protected route: ActivatedRoute,
    protected matDialog: MatDialog,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    protected cdr: ChangeDetectorRef,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.initializeOrganizationsColumns();
    await this.loadProjectList();
    this.subscribeToProjectIdChanges();
  }

  ngOnDestroy(): void {
    this.projectIdSubscription?.unsubscribe();
  }

  private initializeOrganizationsColumns(): void {
    this.columns = [
      this.createSttColumn(),
      this.createOrganizationNameColumn(),
      this.createOrganizationDescriptionColumn()
    ];
  }

  private createSttColumn(): ColumnModel {
    return {
      columnDef: 'stt',
      header: 'stt',
      headerClassName: 'mat-column-stt width-5 min-width-40',
      className: 'mat-column-stt',
      title: (e: OrganizationModel) => this.getOrganizationIndex(e).toString(),
      cell: (e: OrganizationModel) => this.getOrganizationIndex(e).toString(),
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.CENTER,
    };
  }

  private createOrganizationNameColumn(): ColumnModel {
    return {
      columnDef: 'organizationName',
      header: 'name',
      className: 'mat-column-name',
      title: (e: OrganizationModel) => e.organizationName || '',
      cell: (e: OrganizationModel) => e.organizationName || '',
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT,
    };
  }

  private createOrganizationDescriptionColumn(): ColumnModel {
    return {
      columnDef: 'organizationDescription',
      header: 'description',
      title: (e: OrganizationModel) => e.organizationDescription || '',
      cell: (e: OrganizationModel) => e.organizationDescription || '',
      className: 'mat-column-form',
      columnType: ColumnTypeEnum.VIEW,
      alignHeader: AlignEnum.CENTER,
      align: AlignEnum.LEFT,
    };
  }

  private getOrganizationIndex(organization: OrganizationModel): number {
    const organizations = this.addEditForm.get('organizations')?.value as OrganizationModel[];
    return organizations.indexOf(organization) + 1;
  }

  private async loadProjectList(): Promise<void> {
    this.projectList = await lastValueFrom(
      this.selectValuesService.getAutocompleteValuesFromModulePath(
        this.PROJECT_API_PATH,
        undefined,
        undefined,
        undefined,
        true,
      ),
    );
  }

  private subscribeToProjectIdChanges(): void {
    this.projectIdSubscription = this.addEditForm
      .get('projectId')
      ?.valueChanges.pipe(
        debounceTime(this.DEBOUNCE_TIME_MS),
        distinctUntilChanged(),
        filter(projectId => this.isValidProjectId(projectId))
      )
      .subscribe(async (projectId) => {
        if (!this.isLoadingProject) {
          this.isShowInformation = true;
          await this.loadProjectDetail(projectId);
        }
      });
  }

  private isValidProjectId(projectId: any): boolean {
    return projectId != null && projectId !== '';
  }

  private async loadProjectDetail(projectId: number): Promise<void> {
    if (this.isLoadingProject) {
      return;
    }

    try {
      this.isLoadingProject = true;
      const projectDetail = await this.fetchProjectDetail(projectId);

      if (projectDetail?.organizations) {
        this.updateFormWithProjectDetail(projectDetail);
      }
    } catch (error) {
      console.error('Error loading project detail:', error);
    } finally {
      this.isLoadingProject = false;
    }
  }

  private async fetchProjectDetail(projectId: number): Promise<ProjectDetailModel> {
    return lastValueFrom(
      this.apiService.get<ProjectDetailModel>(
        `${this.PROJECT_API_PATH}/${projectId}`,
        new HttpParams()
      )
    );
  }

  private updateFormWithProjectDetail(projectDetail: ProjectDetailModel): void {
    const mappedOrganizations = this.mapOrganizations(projectDetail.organizations);
    this.addEditForm.get('organizations')?.setValue(mappedOrganizations);

    const latestProposal = this.getLatestProposal(projectDetail.projectProposals);
    const proposalDisplay = this.formatProposalDisplay(latestProposal);

    this.addEditForm.patchValue({
      code: projectDetail.code,
      name: projectDetail.name,
      sapCode: projectDetail.sapCode,
      proposal: proposalDisplay,
      projectTypeName: projectDetail.projectTypeName,
      proposingOrgName: projectDetail.proposingOrgName,
      operatingOrgName: projectDetail.operatingOrgName,
      expectedStartDate: projectDetail.expectedStartDate,
      expectedEndDate: projectDetail.expectedEndDate,
      goal: projectDetail.goal,
      scale: projectDetail.scale,
      locationName: projectDetail.locationName,
      address: projectDetail.address,
      // Investment information
      investorOrgId: projectDetail.investorOrgId,
      investorOrgCode: projectDetail.investorOrgCode,
      investorOrgName: projectDetail.investorOrgName,
      investmentFormId: projectDetail.investmentFormId,
      investmentFormCode: projectDetail.investmentFormCode,
      investmentFormName: projectDetail.investmentFormName,
      investmentCapitalSource: projectDetail.investmentCapitalSource,
      totalInvestmentCapital: Utils.formatCurrencyWithComma(Number(projectDetail.totalInvestmentCapital) || 0),
      expressionInvestmentId: projectDetail.expressionInvestmentId,
      expressionInvestmentCode: projectDetail.expressionInvestmentCode,
      expressionInvestmentName: projectDetail.expressionInvestmentName,
      startDateInvestment: projectDetail.startDateInvestment,
      endDateInvestment: projectDetail.endDateInvestment,
      informationTypeInvestmentId: projectDetail.informationTypeInvestmentId,
      informationTypeInvestmentCode: projectDetail.informationTypeInvestmentCode,
      informationTypeInvestmentName: projectDetail.informationTypeInvestmentName,
      frequencyInvestment: projectDetail.frequencyInvestment,
      currencyId: projectDetail.currencyId,
      currencyCode: projectDetail.currencyCode,
      currencyName: projectDetail.currencyName
    });

    this.cdr.detectChanges();
  }

  private mapOrganizations(organizations: any[]): OrganizationModel[] {
    return organizations.map((org: any) => ({
      ...org,
      organizationName: org.organizationName,
      organizationDescription: org.organizationDescription
    }));
  }

  private getLatestProposal(proposals: any[]): any | null {
    if (!proposals || proposals.length === 0) {
      return null;
    }

    const sortedProposals = [...proposals].sort((a, b) => {
      const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return dateB - dateA;
    });

    return sortedProposals[0];
  }

  private formatProposalDisplay(proposal: any): string {
    if (!proposal) {
      return '';
    }
    const code = proposal.code ?? '';
    const name = proposal.name ?? '';
    return `(${code}) ${name}`.trim();
  }
}
