import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {Utils} from 'src/app/shared/utils/utils';
import { ProjectTypeModel } from './project-type.model';

export interface ExpressionDetailItem {
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  id?: number;
  status?: 'APPROVED' | 'DRAFT' | 'REJECTED';
  expressionDetailId?: number;
  name: string;
  dataType: 'NUMBER' | 'TEXT' | 'DATE' | 'REFERENCE' | string;
  maxLength?: number | string | null;
  referenceTable?: string | null;
  targetId: number;
  targetName?: string;
  targetStatus?: 'APPROVED' | 'REJECTED';
  targetCode?: string;
  targetGroupName?: string;
  targetDescription?: string;
}

export interface ExpressionDetail {
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  id?: number;
  keyword?: string;
  status?: 'APPROVED' | 'DRAFT' | 'REJECTED';
  name?: string;
  itemType: 'QUALITATIVE' | 'QUANTITATIVE';
  description?: string;
  displayOrder?: number;
  expressionId?: number;
  dataType?: string;
  maxLength?: number | string | null;
  expressionDetailItems: ExpressionDetailItem[];
}

export class FormConfigurationModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  type: string | null = null;
  targetId: string | null = null;
  targetName: string | null = null;
  targetDescription: string | null = null;
  targetGroupName: string | null = null;
  dataType: string | null = null;
  projectTypes: any[] = [];
  description: string | null = null;
  organizations: number[] = [];
  maxLength: number | null = null;
  expressionTypeId: number | null = null;
  expressionTypeName: string | null = null;
  informationTypeId: number | null = null;
  informationTypeName: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  expressionDetails: ExpressionDetail[] = []; // Updated type
  isUserInput: boolean = false;

  constructor(form: FormGroup) {
    super();

    this.code = Utils.getFormControlValue(form, 'code');
    this.name = Utils.getFormControlValue(form, 'name');
    this.type = Utils.getFormControlValue(form, 'type');
    this.dataType = Utils.getFormControlValue(form, 'dataType');
    this.projectTypes = Utils.getFormControlValue(form, 'projectTypes').map((item: number) => ({ id: item }));
    this.description = Utils.getFormControlValue(form, 'description');
    this.organizations = Utils.getFormControlValue(form, 'organizations');
    this.status = Utils.getFormControlValue(form, 'status');
    this.expressionTypeId = Utils.getFormControlValue(form, 'expressionTypeId');
    this.expressionTypeName = Utils.getFormControlValue(form, 'expressionTypeName');
    this.informationTypeId = Utils.getFormControlValue(form, 'informationTypeId');
    this.informationTypeName = Utils.getFormControlValue(form, 'informationTypeName');
    this.expressionDetails = Utils.getFormControlValue(form, 'expressionDetails').map((item: any) => ({
      ...item,
      name: item.name.trim(),
      displayOrder: item.displayOrder,
      description: item.description.trim(),
      expressionDetailItems: item.itemType === 'QUANTITATIVE' ? item.expressionDetailItems.map((detailItem: any) => ({
        targetId: detailItem.targetId,
      })) : item.expressionDetailItems.map((detailItem: ExpressionDetail) => ({
        name: detailItem.name?.trim(),
        dataType: detailItem.dataType,
        referenceTable : detailItem.dataType === 'REFERENCE' ? detailItem.maxLength : null,
        maxLength: detailItem.dataType === 'REFERENCE' ? null : detailItem.maxLength,
      })),
    })) || [];
    this.isUserInput = Utils.getFormControlValue(form, 'isUserInput') || false;
  }
}