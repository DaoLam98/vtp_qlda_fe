import { BaseModel } from '@c10t/nice-component-library';
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";
import { SignDocumentModel } from 'src/app/shared/models/sign-document.model';

export class ProjectEvaluationModel extends BaseModel {
  id: number | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  projectId: number | null = null;
  projectCode: string | null = null;
  projectName: string | null = null;
  reportName: string | null = null;
  evaluationStartDate: string | null = null;
  evaluationEndDate: string | null = null;
  description: string | null = null;
  signDocumentDto: SignDocumentModel | null = null;
  voObject: string | null = null;
  voStatus: string | null = null;
  effectivenessExpressionId: number | null = null;
  effectivenessExpressionName: string | null = null;
  effectivenessExpressionCode: string | null = null;
  effectivenessStartDate: string | null = null;
  effectivenessEndDate: string | null = null;
  effectivenessItems: ProjectEvaluationEffectivenessItemModel[] = [];
  implStatusExpressionId: number | null = null;
  implStatusExpressionName: string | null = null;
  implStatusExpressionCode: string | null = null;
  implStatusStartDate: string | null = null;
  implStatusEndDate: string | null = null;
  implStatusItems: ProjectEvaluationImplStatusItemModel[] = [];
  projectEvalActionType: string | null = null;
  isApplyImplStatus = false
  isApplyEffectiveness = false
  startDateInvestment: string | null = null;
  endDateInvestment: string | null = null;
  frequencyInvestment: string | null = null;
  /**
   * @description WAITING - Dự thảo; IN_PROGRESS - Đang trình ký; APPROVED - Đã phê duyệt; REJECTED - Từ chối; REVOKED - Bị hủy luồng; CANCELLED - Đã hủy
   */
  projectEvalStatus: 'WAITING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'CANCELLED' | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.status = Utils.getFormControlValue(form, 'status', 'APPROVED');
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.projectCode = Utils.getFormControlValue(form, 'projectCode');
      this.projectName = Utils.getFormControlValue(form, 'projectName');
      this.reportName = Utils.getFormControlValue(form, 'reportName');
      this.evaluationStartDate = Utils.getFormControlValue(form, 'evaluationStartDate');
      this.evaluationEndDate = Utils.getFormControlValue(form, 'evaluationEndDate');
      this.description = Utils.getFormControlValue(form, 'description');
      const signDocumentDto = Utils.getFormControlValue(form, 'signDocumentDto');
      if (signDocumentDto) {
        this.signDocumentDto = new SignDocumentModel(structuredClone(signDocumentDto));
      }
      this.voObject = Utils.getFormControlValue(form, 'voObject');
      this.voStatus = Utils.getFormControlValue(form, 'voStatus');

      this.effectivenessExpressionId = Utils.getFormControlValue(form, 'effectivenessExpressionId');
      this.effectivenessExpressionName = Utils.getFormControlValue(form, 'effectivenessExpressionName');
      this.effectivenessExpressionCode = Utils.getFormControlValue(form, 'effectivenessExpressionCode');
      this.effectivenessStartDate = Utils.getFormControlValue(form, 'effectivenessStartDate');
      this.effectivenessEndDate = Utils.getFormControlValue(form, 'effectivenessEndDate');
      this.effectivenessItems = Utils.getFormControlValue(form, 'effectivenessItems', []);

      this.implStatusExpressionId = Utils.getFormControlValue(form, 'implStatusExpressionId');
      this.implStatusExpressionName = Utils.getFormControlValue(form, 'implStatusExpressionName');
      this.implStatusExpressionCode = Utils.getFormControlValue(form, 'implStatusExpressionCode');
      this.implStatusStartDate = Utils.getFormControlValue(form, 'implStatusStartDate');
      this.implStatusEndDate = Utils.getFormControlValue(form, 'implStatusEndDate');
      this.implStatusItems = Utils.getFormControlValue(form, 'implStatusItems', []);

      this.projectEvalActionType = Utils.getFormControlValue(form, 'projectEvalActionType');
      this.projectEvalStatus = Utils.getFormControlValue(form, 'projectEvalStatus')
    } else {
      this.id = form;
    }
  }
}

export class ProjectEvaluationEffectivenessItemModel {
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  projectEvalId: number | null = null;
  itemType: 'QUANTITATIVE' | 'QUALITATIVE' | null = null;
  targetId: number | null = null;
  targetCode: string | null = null;
  targetName: string | null = null;
  amountArising: number | null = null;
  amountActual: number | null = null;
  ratioActualArising: number | null = null;
  amountArisingAccumulated: number | null = null;
  amountActualAccumulated: number | null = null;
  ratioActualArisingAccumulated: number | null = null;
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
  targetExpressionExcel: string | null = null;
  expressionEffectivenessOrder: string | null = null;
  expressionDetailId: number | null = null;
  expressionDetailName: string | null = null;
  expressionDetailItemId: number | null = null;
  expressionDetailItemName: string | null = null;

  constructor(form: FormGroup | number) {
    if (form instanceof FormGroup) {
      this.status = Utils.getFormControlValue(form, 'status', 'APPROVED');
      this.projectEvalId = Utils.getFormControlValue(form, 'projectEvalId');
      this.itemType = Utils.getFormControlValue(form, 'itemType');
      this.targetId = Utils.getFormControlValue(form, 'targetId');
      this.targetCode = Utils.getFormControlValue(form, 'targetCode');
      this.targetName = Utils.getFormControlValue(form, 'targetName');
      this.amountArising = Utils.getFormControlValue(form, 'amountArising');
      this.amountActual = Utils.getFormControlValue(form, 'amountActual');
      this.ratioActualArising = Utils.getFormControlValue(form, 'ratioActualArising');
      this.amountArisingAccumulated = Utils.getFormControlValue(form, 'amountArisingAccumulated');
      this.amountActualAccumulated = Utils.getFormControlValue(form, 'amountActualAccumulated');
      this.ratioActualArisingAccumulated = Utils.getFormControlValue(form, 'ratioActualArisingAccumulated');
      this.typeDate = Utils.getFormControlValue(form, 'typeDate');
      this.targetDataType = Utils.getFormControlValue(form, 'targetDataType');
      this.targetMaxLength = Utils.getFormControlValue(form, 'targetMaxLength');
      this.targetReferenceTable = Utils.getFormControlValue(form, 'targetReferenceTable');
      this.valueReferenceTableId = Utils.getFormControlValue(form, 'valueReferenceTableId');
      this.valueString = Utils.getFormControlValue(form, 'valueString');
      this.valueNumber = Utils.getFormControlValue(form, 'valueNumber');
      this.valueDate = Utils.getFormControlValue(form, 'valueDate');
      this.targetExpressionView = Utils.getFormControlValue(form, 'targetExpressionView');
      this.targetExpressionSpel = Utils.getFormControlValue(form, 'targetExpressionSpel');
      this.targetExpressionTree = Utils.getFormControlValue(form, 'targetExpressionTree');
      this.targetExpressionExcel = Utils.getFormControlValue(form, 'targetExpressionExcel');
      this.expressionEffectivenessOrder = Utils.getFormControlValue(form, 'expressionEffectivenessOrder');
      this.expressionDetailId = Utils.getFormControlValue(form, 'expressionDetailId');
      this.expressionDetailName = Utils.getFormControlValue(form, 'expressionDetailName');
      this.expressionDetailItemId = Utils.getFormControlValue(form, 'expressionDetailItemId');
      this.expressionDetailItemName = Utils.getFormControlValue(form, 'expressionDetailItemName');
    } else {
      this.projectEvalId = form;
    }
  }
}

export class ProjectEvaluationImplStatusItemModel {
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  projectEvalId: number | null = null;
  itemType: 'QUANTITATIVE' | 'QUALITATIVE' | null = null;
  targetId: number | null = null;
  targetCode: string | null = null;
  targetName: string | null = null;
  amountArising: number | null = null;
  amountActual: number | null = null;
  ratioActualArising: number | null = null;
  amountArisingAccumulated: number | null = null;
  amountActualAccumulated: number | null = null;
  ratioActualArisingAccumulated: number | null = null;
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
  targetExpressionExcel: string | null = null;
  expressionImplStatusOrder: string | null = null;
  expressionDetailId: number | null = null;
  expressionDetailName: string | null = null;
  expressionDetailItemId: number | null = null;
  expressionDetailItemName: string | null = null;

  constructor(form: FormGroup | number) {
    if (form instanceof FormGroup) {
      this.status = Utils.getFormControlValue(form, 'status', 'APPROVED');
      this.projectEvalId = Utils.getFormControlValue(form, 'projectEvalId');
      this.itemType = Utils.getFormControlValue(form, 'itemType');
      this.targetId = Utils.getFormControlValue(form, 'targetId');
      this.targetCode = Utils.getFormControlValue(form, 'targetCode');
      this.targetName = Utils.getFormControlValue(form, 'targetName');
      this.amountArising = Utils.getFormControlValue(form, 'amountArising');
      this.amountActual = Utils.getFormControlValue(form, 'amountActual');
      this.ratioActualArising = Utils.getFormControlValue(form, 'ratioActualArising');
      this.amountArisingAccumulated = Utils.getFormControlValue(form, 'amountArisingAccumulated');
      this.amountActualAccumulated = Utils.getFormControlValue(form, 'amountActualAccumulated');
      this.ratioActualArisingAccumulated = Utils.getFormControlValue(form, 'ratioActualArisingAccumulated');
      this.typeDate = Utils.getFormControlValue(form, 'typeDate');
      this.targetDataType = Utils.getFormControlValue(form, 'targetDataType');
      this.targetMaxLength = Utils.getFormControlValue(form, 'targetMaxLength');
      this.targetReferenceTable = Utils.getFormControlValue(form, 'targetReferenceTable');
      this.valueReferenceTableId = Utils.getFormControlValue(form, 'valueReferenceTableId');
      this.valueString = Utils.getFormControlValue(form, 'valueString');
      this.valueNumber = Utils.getFormControlValue(form, 'valueNumber');
      this.valueDate = Utils.getFormControlValue(form, 'valueDate');
      this.targetExpressionView = Utils.getFormControlValue(form, 'targetExpressionView');
      this.targetExpressionSpel = Utils.getFormControlValue(form, 'targetExpressionSpel');
      this.targetExpressionTree = Utils.getFormControlValue(form, 'targetExpressionTree');
      this.targetExpressionExcel = Utils.getFormControlValue(form, 'targetExpressionExcel');
      this.expressionImplStatusOrder = Utils.getFormControlValue(form, 'expressionImplStatusOrder');
      this.expressionDetailId = Utils.getFormControlValue(form, 'expressionDetailId');
      this.expressionDetailName = Utils.getFormControlValue(form, 'expressionDetailName');
      this.expressionDetailItemId = Utils.getFormControlValue(form, 'expressionDetailItemId');
      this.expressionDetailItemName = Utils.getFormControlValue(form, 'expressionDetailItemName');
    } else {
      this.projectEvalId = form;
    }
  }
}

export enum ProjectEvaluationStatusEnum {
  _WAITING = 'project.project-proposal.status.waiting',
  _IN_PROGRESS = 'project.project-proposal.status.in-progress',
  _APPROVED = 'project.project-proposal.status.approved',
  _REJECTED = 'project.project-proposal.status.rejected',
  _REVOKED = 'project.project-proposal.status.revoked',
  _CANCELLED = 'project.project-proposal.status.cancelled',
}