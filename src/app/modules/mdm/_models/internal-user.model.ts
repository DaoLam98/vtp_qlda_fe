import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {Utils} from "src/app/shared/utils/utils";

export class InternalUserModel extends BaseModel {
  code?: string = '';
  name?: string = '';
  organizationId?: string = '';
  organizationName?: string = '';
  dob?: string = "";
  gender?: 'MALE' | 'FEMALE' | string = '';
  roleId?: string = '';
  roleName?: string = '';
  assignerId?: string = '';
  assignerFullName?: string = '';
  assignerCode?: string = "";
  moduleId?: string = '';
  moduleName?: string = '';
  limitAmount?: string = '';
  startDate?: string = '';
  endDate?: string = '';
  positionId?: string = '';
  positionName?: string = '';
  internalUserDelegations: InternalUserModel[] = [];
  fullName: string = ''
  description: string = ''
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.organizationId = Utils.getFormControlValue(form, 'organizationId');
      this.organizationName = Utils.getFormControlValue(form, 'organizationName');
      this.roleId = Utils.getFormControlValue(form, 'roleId');
      this.roleName = Utils.getFormControlValue(form, 'roleName');
      this.assignerId = Utils.getFormControlValue(form, 'assignerId');
      this.assignerFullName = Utils.getFormControlValue(form, 'assignerFullName');
      this.moduleId = Utils.getFormControlValue(form, 'moduleId');
      this.moduleName = Utils.getFormControlValue(form, 'moduleName');
      this.limitAmount = Utils.getFormControlValue(form, 'limitAmount');
      this.startDate = Utils.getFormControlValue(form, 'startDate');
      this.endDate = Utils.getFormControlValue(form, 'endDate');
      this.positionId = Utils.getFormControlValue(form, 'positionId');
      this.positionName = Utils.getFormControlValue(form, 'positionName');
      this.status = Utils.getFormControlValue(form, 'status');
      this.gender = Utils.getFormControlValue(form, 'gender');
      this.dob = Utils.getFormControlValue(form, 'dob');
      this.assignerCode = Utils.getFormControlValue(form, 'assignerCode');
    } else {
      this.id = form;
    }
  }
}
