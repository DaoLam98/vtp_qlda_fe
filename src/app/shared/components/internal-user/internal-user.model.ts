import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export interface UserRole {
  id?: string | number;
  roleId: string | number;
  organizationId: string | number;
  roleName?: string;
  organizationName?: string;
  organizationPath?: string;
  organizationOrgForm?: string;
  organizationIsApproveVo?: boolean;
}

export interface UserPosition {
  id?: string | number;
  positionId: string | number;
  organizationId: string | number;
  positionName?: string;
  organizationName?: string;
}

export interface UserDelegation {
  id?: string | number;
  assignerId: string | number;
  moduleId: string | number;
  moduleName?: string;
  limitAmount?: number;
  startDate?: string;
  endDate?: string;
  assignerCode?: string;
  assignerFullName?: string;
}

export class EmployeeModel extends BaseModel {
  code: string = '';
  name: string = '';
  dob?: string = '';
  fullName: string = '';
  userName: string = '';
  email: string = '';
  phoneNumber: string = '';
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string | undefined = undefined;
  organizationId: number | null = null;
  jobPositionId: number | null = null;
  jobPositionName: string = '';
  organizationName: string = '';
  description: string = '';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' | string | undefined = undefined;
  type: 'COLLABORATOR' | 'PARTNER' = 'COLLABORATOR';
  userRoles: UserRole[] = [];
  internalUserPositions: UserPosition[] = [];
  internalUserDelegations: UserDelegation[] = [];

  constructor(form: FormGroup | number) {
    super();
    if(form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.dob = Utils.getFormControlValue(form, 'dob');
      this.fullName = Utils.getFormControlValue(form, 'fullName');
      this.userName = Utils.getFormControlValue(form, 'userName');
      this.name = Utils.getFormControlValue(form, 'name');
      this.email = Utils.getFormControlValue(form, 'email');
      this.phoneNumber = Utils.getFormControlValue(form, 'phoneNumber');
      this.gender = Utils.getFormControlValue(form, 'gender');
      this.organizationId = Utils.getFormControlValue(form, 'organizationId');
      this.status = Utils.getFormControlValue(form, 'status');
      this.jobPositionId = Utils.getFormControlValue(form, 'jobPositionId');
      this.jobPositionName = Utils.getFormControlValue(form, 'jobPositionName');
      this.organizationName = Utils.getFormControlValue(form, 'organizationName');
      this.description = Utils.getFormControlValue(form, 'description');

      this.userRoles = Utils.getFormControlValue(form, 'userRoles') || [];
      this.internalUserPositions = Utils.getFormControlValue(form, 'internalUserPositions') || [];

      const delegations = Utils.getFormControlValue(form, 'internalUserDelegations') || [];
      this.internalUserDelegations = delegations.map((item: UserDelegation) => ({
        ...item,
        endDate: !item.endDate || item.endDate === "" ? null : item.endDate
      }));
    } else {
      this.id = form;
    }
  }
}
