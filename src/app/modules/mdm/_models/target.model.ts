import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';
import { OrganizationModel } from 'src/app/modules/mdm/_models/organization.model';
import { AccountingAccountModel } from 'src/app/modules/mdm/_models/accounting-account.model';

export class TargetModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  parentName: string | null = null;
  parentId: number | null = null;
  targetGroupName: string | null = null;
  targetGroupId: string | null = null;
  unitOfMeasureId: number | null = null;
  currencyId: number | null = null;
  keyword: string | null = null;
  description: string | null = null;
  dataType: string | null = null;
  isCumulative: boolean | null = false;
  organizations: OrganizationModel[] = [];
  accountingAccounts: AccountingAccountModel[] = [];
  warningConfigs: [] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  expressionSpel: any;
  expressionExcel: any;
  expressionTree: any;
  expressionView: string | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.assignBasicFields(form);
      this.assignMetaFields(form);
    } else {
      this.id = form;
    }
  }

  private assignBasicFields(form: FormGroup): void {
    this.id = Utils.getFormControlValue(form, 'id');
    this.code = Utils.getFormControlValue(form, 'code');
    this.name = Utils.getFormControlValue(form, 'name');
    this.status = Utils.getFormControlValue(form, 'status');
    this.parentId = Utils.getFormControlValue(form, 'parentId');
    this.targetGroupId = Utils.getFormControlValue(form, 'targetGroupId');
    this.unitOfMeasureId = Utils.getFormControlValue(form, 'unitOfMeasureId');
    this.currencyId = Utils.getFormControlValue(form, 'currencyId');
    this.description = Utils.getFormControlValue(form, 'description');
    this.accountingAccounts = Utils.getFormControlValue(form, 'accountingAccounts');
    this.organizations = Utils.getFormControlValue(form, 'organizations');
    this.isCumulative = Utils.getFormControlValue(form, 'isCumulative');
    this.warningConfigs = Utils.getFormControlValue(form, 'warningConfigs');
    this.dataType = Utils.getFormControlValue(form, 'dataType');
  }

  private assignMetaFields(form: FormGroup): void {
    this.keyword = Utils.getFormControlValue(form, 'keyword');
  }
}
