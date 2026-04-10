import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {Utils} from 'src/app/shared/utils/utils';

export class FormDataCollectionModel extends BaseModel {
  id: number | null = null;
  keyword: string | null = null;
  dataGatheringStatus: string | null = null;
  status: string | null = null;

  projectId: number | null = null;
  projectName: string | null = null;
  projectCode: string | null = null;

  organizationId: number | null = null;
  organizationName: string | null = null;
  organizationCode: string | null = null;

  expressionId: number | null = null;
  expressionName: string | null = null;
  expressionCode: string | null = null;

  expressionInformationTypeId: number | null = null;
  expressionInformationTypeName: string | null = null;

  startDate: string | null = null;
  endDate: string | null = null;

  frequency: string | null = null;
  isApplyExpression: boolean = false;
  customStatus: string | null = null;

  constructor(form: FormGroup) {
    super();

    this.keyword = Utils.getFormControlValue(form, 'keyword');
    this.status = Utils.getFormControlValue(form, 'status');

    this.projectId = Utils.getFormControlValue(form, 'projectId');
    this.expressionId = Utils.getFormControlValue(form, 'expressionId');
    this.expressionName = Utils.getFormControlValue(form, 'expressionName');
    this.expressionCode = Utils.getFormControlValue(form, 'expressionCode');
    this.expressionInformationTypeId = Utils.getFormControlValue(form, 'expressionInformationTypeId');
    this.expressionInformationTypeName = Utils.getFormControlValue(form, 'expressionInformationTypeName');

    this.startDate = Utils.getFormControlValue(form, 'startDate');
    this.endDate = Utils.getFormControlValue(form, 'endDate');
    this.frequency = Utils.getFormControlValue(form, 'frequency');
    this.organizationId = Utils.getFormControlValue(form, 'organizationId');
    this.organizationName = Utils.getFormControlValue(form, 'organizationName');
    this.organizationCode = Utils.getFormControlValue(form, 'organizationCode');
    this.isApplyExpression = Boolean(Utils.getFormControlValue(form, 'isApplyExpression'));
    this.dataGatheringStatus = Utils.getFormControlValue(form, 'dataGatheringStatus');
  }
}