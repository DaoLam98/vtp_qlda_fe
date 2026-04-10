import { BaseModel } from '@c10t/nice-component-library';
import { FormGroup } from '@angular/forms';
import { Utils } from 'src/app/shared/utils/utils';
import { OrganizationModel } from './projects-information.model';
import { SignDocumentModel } from 'src/app/shared/models/sign-document.model';

export class ProjectProposalModel extends BaseModel {
  name: string | null = null;
  code: string | null = null;
  operatingOrgId: number | null = null;
  operatingOrgName: string | null = null;
  proposingOrgId: number | null = null;
  proposingOrgName: string | null = null;
  projectTypeId: number | null = null;
  projectTypeCode: number | null = null;
  projectTypeName: string | null = null;
  expectedStartDate: string | null = null;
  expectedEndDate: string | null = null;
  goal: string | null = null;
  scale: string | null = null;
  locationId: number | null = null;
  locationName: string | null = null;
  address: string | null = null;
  investorOrgId: number | null = null;
  investorOrgName: string | null = null;
  investmentFormId: number | null = null;
  investmentFormName: string | null = null;
  investmentCapitalSource: string | null = null;
  expressionInvestmentId: number | null = null;
  expressionInvestmentName: string | null = null;
  expressionFeasibilityReportId: number | null = null;
  expressionFeasibilityReportName: string | null = null;
  startDateInvestment: string | null = null;
  endDateInvestment: string | null = null;
  startDateFeasibilityReport: string | null = null;
  endDateFeasibilityReport: string | null = null;
  informationTypeInvestmentId: number | null = null;
  informationTypeInvestmentName: string | null = null;
  informationTypeFeasibilityReportId: number | null = null;
  informationTypeFeasibilityReportName: string | null = null;
  frequencyInvestment: string | null = null;
  frequencyFeasibilityReport: string | null = null;
  organizations: OrganizationModel[] = [];
  signDocumentDto: SignDocumentModel | null = null;
  voObject: string | null = null;
  error: string | null = null;
  voStatus: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  validateActionType: 'APPLY_FEASIBILITY_REPORT' | 'APPLY_INVESTMENT' | 'SAVE' | 'SEND_VO' | null = null;
  /**
   * @description WAITING - Dự thảo; IN_PROGRESS - Đang trình ký; APPROVED - Đã phê duyệt; REJECTED - Từ chối; REVOKED - Bị hủy luồng; CANCELLED - Đã hủy; ISSUED - Đã ban hành
   */
  projectProposalStatus: 'WAITING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'CANCELLED' | 'ISSUED' | null = null;
  totalInvestmentCapital: number | null = null;
  currencyId: number | null = null;
  currencyName: string | null = null;
  isValidateFull: boolean |null = null;
  referenceId: number | null = null;
  referenceName: string | null = null
  referenceCode: string | null = null;
  isUpgraded: boolean |null = null;
  projectId: number | null = null;
  isOnlyVtpApproved: boolean | null = null;
  reasonUpgrade: string | null = null;
  folderSignId: number | null = null
  folderSignParentId: number | null = null;
  upgraded: boolean | null = null
  approvedDate: string | null = null;
  isApplyInvestment: boolean | null = null;
  isApplyFeasibility: boolean | null = null;

  constructor(form?: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.status = Utils.getFormControlValue(form, 'status');
      this.address = Utils.getFormControlValue(form, 'address');
      this.proposingOrgId = Utils.getFormControlValue(form, 'proposingOrgId');
      this.operatingOrgId = Utils.getFormControlValue(form, 'operatingOrgId');
      this.investmentFormId = Utils.getFormControlValue(form, 'investmentFormId');
      this.operatingOrgName = Utils.getFormControlValue(form, 'operatingOrgName');
      this.proposingOrgName = Utils.getFormControlValue(form, 'proposingOrgName');
      this.projectTypeId = Utils.getFormControlValue(form, 'projectTypeId');
      this.projectTypeCode = Utils.getFormControlValue(form, 'projectTypeCode');
      this.projectTypeName = Utils.getFormControlValue(form, 'projectTypeName');
      this.expectedStartDate = Utils.getFormControlValue(form, 'expectedStartDate');
      this.expectedEndDate = Utils.getFormControlValue(form, 'expectedEndDate');
      this.goal = Utils.getFormControlValue(form, 'goal');
      this.scale = Utils.getFormControlValue(form, 'scale');
      this.locationId = Utils.getFormControlValue(form, 'locationId');
      this.locationName = Utils.getFormControlValue(form, 'locationName');
      this.investorOrgId = Utils.getFormControlValue(form, 'investorOrgId');
      this.investorOrgName = Utils.getFormControlValue(form, 'investorOrgName');
      this.investmentFormName = Utils.getFormControlValue(form, 'investmentFormName');
      this.investmentCapitalSource = Utils.getFormControlValue(form, 'investmentCapitalSource');
      this.expressionInvestmentId = Utils.getFormControlValue(form, 'expressionInvestmentId');
      this.expressionInvestmentName = Utils.getFormControlValue(form, 'expressionInvestmentName');
      this.expressionFeasibilityReportId = Utils.getFormControlValue(form, 'expressionFeasibilityReportId');
      this.expressionFeasibilityReportName = Utils.getFormControlValue(form, 'expressionFeasibilityReportName');
      this.startDateInvestment = Utils.getFormControlValue(form, 'startDateInvestment');
      this.endDateInvestment = Utils.getFormControlValue(form, 'endDateInvestment');
      this.startDateFeasibilityReport = Utils.getFormControlValue(form, 'startDateFeasibilityReport');
      this.endDateFeasibilityReport = Utils.getFormControlValue(form, 'endDateFeasibilityReport');
      this.informationTypeInvestmentId = Utils.getFormControlValue(form, 'informationTypeInvestmentId');
      this.informationTypeInvestmentName = Utils.getFormControlValue(form, 'informationTypeInvestmentName');
      this.informationTypeFeasibilityReportId = Utils.getFormControlValue(form, 'informationTypeFeasibilityReportId');
      this.informationTypeFeasibilityReportName = Utils.getFormControlValue(form, 'informationTypeFeasibilityReportName');
      this.frequencyInvestment = Utils.getFormControlValue(form, 'frequencyInvestment');
      this.frequencyFeasibilityReport = Utils.getFormControlValue(form, 'frequencyFeasibilityReport');
      this.organizations = Utils.getFormControlValue(form, 'organizations');
      this.voObject = Utils.getFormControlValue(form, 'voObject');
      this.error = Utils.getFormControlValue(form, 'error');
      this.voStatus = Utils.getFormControlValue(form, 'voStatus');
      this.validateActionType = Utils.getFormControlValue(form, 'validateActionType');
      this.totalInvestmentCapital = Utils.getFormControlValue(form, 'totalInvestmentCapital');
      this.currencyId = Utils.getFormControlValue(form, 'currencyId');
      this.currencyName = Utils.getFormControlValue(form, 'currencyName');
      this.projectProposalStatus = Utils.getFormControlValue(form, 'projectProposalStatus');
      const signDocumentDto = Utils.getFormControlValue(form, 'signDocumentDto');
      if (signDocumentDto) {
        this.signDocumentDto = new SignDocumentModel(structuredClone(signDocumentDto));
      }
      this.referenceId = Utils.getFormControlValue(form, 'referenceId');
      this.referenceName = Utils.getFormControlValue(form, 'referenceName');
      this.referenceCode = Utils.getFormControlValue(form, 'referenceCode');
      this.isUpgraded = Utils.getFormControlValue(form, 'isUpgraded');
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.isOnlyVtpApproved = Utils.getFormControlValue(form, 'isOnlyVtpApproved');
      this.reasonUpgrade = Utils.getFormControlValue(form, 'reasonUpgrade');
      this.folderSignId = Utils.getFormControlValue(form, 'folderSignId');
      this.folderSignParentId = Utils.getFormControlValue(form, 'folderSignParentId');
      this.upgraded = Utils.getFormControlValue(form, 'upgraded');
      this.approvedDate = Utils.getFormControlValue(form, 'approvedDate');
      this.isApplyInvestment = Utils.getFormControlValue(form, 'isApplyInvestment');
      this.isApplyFeasibility = Utils.getFormControlValue(form, 'isApplyFeasibility');
    }
  }
}

export class ProjectProposalInvestmentItemModel extends BaseModel {
  projectProposalId: number | null = null;
  itemType: 'QUANTITATIVE' | 'QUALITATIVE' | null = null;
  assetId: number | null = null;
  assetName: string | null = null;
  targetId: number | null = null;
  targetName: string | null = null;
  accountingAccountId: number | null = null;
  accountingAccountName: string | null = null;
  typeDate: string | null = null;
  targetDataType: 'STRING' | 'NUMBER' | 'REFERENCE' | 'DATE' | null = null;
  targetMaxLength: number | null = null;
  targetReferenceTable: string | null = null;
  valueReferenceTableId: number | null = null;
  valueString: string | null = null;
  valueNumber: number | null = null;
  valueDate: string | null = null;
  targetExpressionView: string | null = null;
  targetExpressionSpel: string | null = null;
  targetExpressionTree: string | null = null;
  expressionInvestmentOrder: string | null = null;
  expressionDetailId: number | null = null;
  expressionDetailName: string | null = null;
  expressionDetailItemId: number | null = null;
  expressionDetailItemName: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
}

export class ProjectProposalFeasibilityReportItemModel extends BaseModel {
  projectProposalId: number | null = null;
  itemType: 'QUANTITATIVE' | 'QUALITATIVE' | null = null;
  assetId: number | null = null;
  assetName: string | null = null;
  targetId: number | null = null;
  targetName: string | null = null;
  accountingAccountId: number | null = null;
  accountingAccountName: string | null = null;
  typeDate: string | null = null;
  targetDataType: 'STRING' | 'NUMBER' | 'REFERENCE' | 'DATE' | null = null;
  targetMaxLength: number | null = null;
  targetReferenceTable: string | null = null;
  valueReferenceTableId: number | null = null;
  valueString: string | null = null;
  valueNumber: number | null = null;
  valueDate: string | null = null;
  targetExpressionView: string | null = null;
  targetExpressionSpel: string | null = null;
  targetExpressionTree: string | null = null;
  expressionFeasibilityOrder: string | null = null;
  expressionDetailId: number | null = null;
  expressionDetailName: string | null = null;
  expressionDetailItemId: number | null = null;
  expressionDetailItemName: string | null = null;
  keyGenValue: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
}

export enum ProjectProposalStatusEnum {
  _WAITING = 'project.project-proposal.status.waiting',
  _IN_PROGRESS = 'project.project-proposal.status.in-progress',
  _APPROVED = 'project.project-proposal.status.approved',
  _REJECTED = 'project.project-proposal.status.rejected',
  _REVOKED = 'project.project-proposal.status.revoked',
  _CANCELLED = 'project.project-proposal.status.cancelled',
  _ISSUED = 'project.project-proposal.status.issued',
}

