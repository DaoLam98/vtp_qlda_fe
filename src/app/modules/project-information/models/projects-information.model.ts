import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export type Status = 'APPROVED' | 'DRAFT' | 'REJECTED';
export type OrgType = 'CORPORATION' | 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'TEAM' | 'CENTER' | 'UNKNOWN';
export type OrgForm = 'DEPENDENT' | 'INDEPENDENT';
export type ArchiveType = 'FOLDER' | 'FILE';
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export class OrganizationModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;
  status: Status = 'DRAFT';
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  sapId: number | null = null;
  orgType: OrgType = 'CORPORATION';
  orgForm: OrgForm = 'DEPENDENT';
  isApproveVo: boolean = false;
  parentId: number | null = null;
  parentCode: string | null = null;
  parentName: string | null = null;
  path: string | null = null;
  pathName: string | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.orgType = Utils.getFormControlValue(form, 'orgType');
      this.orgForm = Utils.getFormControlValue(form, 'orgForm');
      this.sapId = Utils.getFormControlValue(form, 'sapId');
      this.isApproveVo = Utils.getFormControlValue(form, 'isApproveVo');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentCode = Utils.getFormControlValue(form, 'parentCode');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.path = Utils.getFormControlValue(form, 'path');
      this.pathName = Utils.getFormControlValue(form, 'pathName');
    } else {
      this.id = form;
    }
  }
}

export class ProjectArchiveModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;
  status: Status = 'DRAFT';
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  parentId: number | null = null;
  parentCode: string | null = null;
  parentName: string | null = null;
  projectId: number | null = null;
  projectCode: string | null = null;
  projectName: string | null = null;
  archiveType: ArchiveType = 'FOLDER';
  path: string | null = null;
  pathName: string | null = null;
  filePath: string | null = null;
  fileName: string | null = null;
  sequenceNo: number = 0;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentCode = Utils.getFormControlValue(form, 'parentCode');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.projectCode = Utils.getFormControlValue(form, 'projectCode');
      this.projectName = Utils.getFormControlValue(form, 'projectName');
      this.archiveType = Utils.getFormControlValue(form, 'archiveType');
      this.path = Utils.getFormControlValue(form, 'path');
      this.pathName = Utils.getFormControlValue(form, 'pathName');
      this.filePath = Utils.getFormControlValue(form, 'filePath');
      this.fileName = Utils.getFormControlValue(form, 'fileName');
      this.sequenceNo = Utils.getFormControlValue(form, 'sequenceNo');
    } else {
      this.id = form;
    }
  }
}

export class ProjectProposalModel extends BaseModel {
  id: number | null = null;
  keyword: string | null = null;
  status: Status = 'DRAFT';
  code: string | null = null;
  name: string | null = null;

  operatingOrgId: number | null = null;
  operatingOrgName: string | null = null;
  proposingOrgId: number | null = null;
  proposingOrgName: string | null = null;

  projectTypeId: number | null = null;
  projectTypeCode: string | null = null;
  projectTypeName: string | null = null;
  projectProposalStatus: 'WAITING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'CANCELLED' | 'ISSUED' | null = null;
  goal: string | null = null;
  scale: string | null = null;
  locationId: number | null = null;
  address: string | null = null;

  investorOrgId: number | null = null;
  investmentFormId: number | null = null;
  investmentFormName: string | null = null;
  investmentCapitalSource: string | null = null;

  expressionInvestmentId: number | null = null;
  expressionInvestmentName: string | null = null;
  expressionFeasibilityReportId: number | null = null;
  expressionFeasibilityReportName: string | null = null;

  organizations: OrganizationModel[] = [];

  error: string | null = null;
  voStatus: Status = 'DRAFT';
  referenceId: number | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.operatingOrgId = Utils.getFormControlValue(form, 'operatingOrgId');
      this.operatingOrgName = Utils.getFormControlValue(form, 'operatingOrgName');
      this.proposingOrgId = Utils.getFormControlValue(form, 'proposingOrgId');
      this.proposingOrgName = Utils.getFormControlValue(form, 'proposingOrgName');
      this.projectTypeId = Utils.getFormControlValue(form, 'projectTypeId');
      this.projectTypeCode = Utils.getFormControlValue(form, 'projectTypeCode');
      this.projectTypeName = Utils.getFormControlValue(form, 'projectTypeName');
      this.goal = Utils.getFormControlValue(form, 'goal');
      this.scale = Utils.getFormControlValue(form, 'scale');
      this.locationId = Utils.getFormControlValue(form, 'locationId');
      this.address = Utils.getFormControlValue(form, 'address');
      this.investorOrgId = Utils.getFormControlValue(form, 'investorOrgId');
      this.investmentFormId = Utils.getFormControlValue(form, 'investmentFormId');
      this.investmentFormName = Utils.getFormControlValue(form, 'investmentFormName');
      this.investmentCapitalSource = Utils.getFormControlValue(form, 'investmentCapitalSource');
      this.expressionInvestmentId = Utils.getFormControlValue(form, 'expressionInvestmentId');
      this.expressionInvestmentName = Utils.getFormControlValue(form, 'expressionInvestmentName');
      this.expressionFeasibilityReportId = Utils.getFormControlValue(form, 'expressionFeasibilityReportId');
      this.expressionFeasibilityReportName = Utils.getFormControlValue(form, 'expressionFeasibilityReportName');
      this.voStatus = Utils.getFormControlValue(form, 'voStatus');
      this.referenceId = Utils.getFormControlValue(form, 'referenceId');
      this.projectProposalStatus = Utils.getFormControlValue(form, 'projectProposalStatus')
    } else {
      this.id = form;
    }
  }
}

export class ProjectDetailModel extends BaseModel {
  id: number | null = null;
  status: Status = 'DRAFT';
  code: string | null = null;
  name: string | null = null;
  sapCode: string | null = null;

  // Operating Organization
  operatingOrgId: number | null = null;
  operatingOrgCode: string | null = null;
  operatingOrgName: string | null = null;

  // Proposing Organization
  proposingOrgId: number | null = null;
  proposingOrgCode: string | null = null;
  proposingOrgName: string | null = null;

  // Project Type
  projectTypeId: number | null = null;
  projectTypeCode: string | null = null;
  projectTypeName: string | null = null;

  // Dates
  expectedStartDate: string | null = null;
  expectedEndDate: string | null = null;

  // Details
  goal: string | null = null;
  scale: string | null = null;

  // Location
  locationId: number | null = null;
  locationCode: string | null = null;
  locationName: string | null = null;
  address: string | null = null;

  // Investor Organization
  investorOrgId: number | null = null;
  investorOrgCode: string | null = null;
  investorOrgName: string | null = null;

  // Investment Form
  investmentFormId: number | null = null;
  investmentFormCode: string | null = null;
  investmentFormName: string | null = null;
  investmentCapitalSource: string | null = null;
  totalInvestmentCapital: string | null = null;
  // Expression Investment
  expressionInvestmentId: number | null = null;
  expressionInvestmentCode: string | null = null;
  expressionInvestmentName: string | null = null;

  // Expression Feasibility Report
  expressionFeasibilityReportId: number | null = null;
  expressionFeasibilityReportCode: string | null = null;
  expressionFeasibilityReportName: string | null = null;

  // Investment Dates
  startDateInvestment: string | null = null;
  endDateInvestment: string | null = null;

  // Feasibility Report Dates
  startDateFeasibilityReport: string | null = null;
  endDateFeasibilityReport: string | null = null;

  // Information Type Investment
  informationTypeInvestmentId: number | null = null;
  informationTypeInvestmentCode: string | null = null;
  informationTypeInvestmentName: string | null = null;

  // Information Type Feasibility Report
  informationTypeFeasibilityReportId: number | null = null;
  informationTypeFeasibilityReportCode: string | null = null;
  informationTypeFeasibilityReportName: string | null = null;

  currencyId: number | null = null;
  currencyCode: string | null = null;
  currencyName: string | null = null;
  isUpdated: boolean = false;

  // Frequency
  frequencyInvestment: Frequency = 'DAILY';
  frequencyFeasibilityReport: Frequency = 'DAILY';

  // Arrays
  organizations: OrganizationModel[] = [];
  projectArchives: ProjectArchiveModel[] = [];
  projectProposals: ProjectProposalModel[] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.sapCode = Utils.getFormControlValue(form, 'sapCode');
      this.status = Utils.getFormControlValue(form, 'status');

      this.operatingOrgId = Utils.getFormControlValue(form, 'operatingOrgId');
      this.operatingOrgCode = Utils.getFormControlValue(form, 'operatingOrgCode');
      this.operatingOrgName = Utils.getFormControlValue(form, 'operatingOrgName');

      this.proposingOrgId = Utils.getFormControlValue(form, 'proposingOrgId');
      this.proposingOrgCode = Utils.getFormControlValue(form, 'proposingOrgCode');
      this.proposingOrgName = Utils.getFormControlValue(form, 'proposingOrgName');

      this.projectTypeId = Utils.getFormControlValue(form, 'projectTypeId');
      this.projectTypeCode = Utils.getFormControlValue(form, 'projectTypeCode');
      this.projectTypeName = Utils.getFormControlValue(form, 'projectTypeName');

      this.expectedStartDate = Utils.getFormControlValue(form, 'expectedStartDate');
      this.expectedEndDate = Utils.getFormControlValue(form, 'expectedEndDate');

      this.goal = Utils.getFormControlValue(form, 'goal');
      this.scale = Utils.getFormControlValue(form, 'scale');

      this.locationId = Utils.getFormControlValue(form, 'locationId');
      this.locationCode = Utils.getFormControlValue(form, 'locationCode');
      this.locationName = Utils.getFormControlValue(form, 'locationName');
      this.address = Utils.getFormControlValue(form, 'address');

      this.investorOrgId = Utils.getFormControlValue(form, 'investorOrgId');
      this.investorOrgCode = Utils.getFormControlValue(form, 'investorOrgCode');
      this.investorOrgName = Utils.getFormControlValue(form, 'investorOrgName');

      this.investmentFormId = Utils.getFormControlValue(form, 'investmentFormId');
      this.investmentFormCode = Utils.getFormControlValue(form, 'investmentFormCode');
      this.investmentFormName = Utils.getFormControlValue(form, 'investmentFormName');
      this.investmentCapitalSource = Utils.getFormControlValue(form, 'investmentCapitalSource');
      this.totalInvestmentCapital = Utils.getFormControlValue(form, 'totalInvestmentCapital');
      this.expressionInvestmentId = Utils.getFormControlValue(form, 'expressionInvestmentId');
      this.expressionInvestmentCode = Utils.getFormControlValue(form, 'expressionInvestmentCode');
      this.expressionInvestmentName = Utils.getFormControlValue(form, 'expressionInvestmentName');

      this.expressionFeasibilityReportId = Utils.getFormControlValue(form, 'expressionFeasibilityReportId');
      this.expressionFeasibilityReportCode = Utils.getFormControlValue(form, 'expressionFeasibilityReportCode');
      this.expressionFeasibilityReportName = Utils.getFormControlValue(form, 'expressionFeasibilityReportName');

      this.startDateInvestment = Utils.getFormControlValue(form, 'startDateInvestment');
      this.endDateInvestment = Utils.getFormControlValue(form, 'endDateInvestment');

      this.startDateFeasibilityReport = Utils.getFormControlValue(form, 'startDateFeasibilityReport');
      this.endDateFeasibilityReport = Utils.getFormControlValue(form, 'endDateFeasibilityReport');

      this.informationTypeInvestmentId = Utils.getFormControlValue(form, 'informationTypeInvestmentId');
      this.informationTypeInvestmentCode = Utils.getFormControlValue(form, 'informationTypeInvestmentCode');
      this.informationTypeInvestmentName = Utils.getFormControlValue(form, 'informationTypeInvestmentName');

      this.informationTypeFeasibilityReportId = Utils.getFormControlValue(form, 'informationTypeFeasibilityReportId');
      this.informationTypeFeasibilityReportCode = Utils.getFormControlValue(form, 'informationTypeFeasibilityReportCode');
      this.informationTypeFeasibilityReportName = Utils.getFormControlValue(form, 'informationTypeFeasibilityReportName');

      this.frequencyInvestment = Utils.getFormControlValue(form, 'frequencyInvestment');
      this.frequencyFeasibilityReport = Utils.getFormControlValue(form, 'frequencyFeasibilityReport');
      this.projectProposals = Utils.getFormControlValue(form, 'projectProposals');

      this.currencyId = Utils.getFormControlValue(form, 'currencyId');
      this.currencyCode = Utils.getFormControlValue(form, 'currencyCode');
      this.currencyName = Utils.getFormControlValue(form, 'currencyName');
      this.isUpdated = Utils.getFormControlValue(form, 'isUpdated')
    } else {
      this.id = form;
    }
  }
}
