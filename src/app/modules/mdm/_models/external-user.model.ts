import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {RoleDetailModel} from './role.model';
import {Utils} from "src/app/shared/utils/utils";

export class ExternalUserDetailModel extends BaseModel {
  code:  string | null = null;
  type: "COLLABORATOR" | "PARTNER" = 'COLLABORATOR';
  userName:  string | null = null;
  fullName:  string | null = null;
  email: string | null = null;
  phoneNumber: string | null = null;
  description: string | null = null;
  gender: 'MALE' | 'FEMALE' = "MALE";
  dob: string | null = null;
  organizationId: number | null = null;
  organizationName: string | null = null;
  organizationCode: string | null = null;
  userRoles: ExternalUserRoleModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      this.type = Utils.getFormControlValue(form,'type');
      this.userName = Utils.getFormControlValue(form,'userName');
      this.code = Utils.getFormControlValue(form,'code');
      this.fullName = Utils.getFormControlValue(form,'fullName');
      this.phoneNumber = Utils.getFormControlValue(form,'phoneNumber');
      this.email = Utils.getFormControlValue(form,'email');
      this.description = Utils.getFormControlValue(form,'description');
      if(this.type === "COLLABORATOR") {
        this.organizationId = Utils.getFormControlValue(form,'organizationId');
        this.organizationName = Utils.getFormControlValue(form,'organizationName');
        this.organizationCode = Utils.getFormControlValue(form,'organizationCode');
      } else {
        this.organizationId = null;
        this.organizationName = null;
        this.organizationCode = null;
      }
      this.gender = Utils.getFormControlValue(form,'gender');
      this.dob = Utils.getFormControlValue(form,'dob');
      this.status = Utils.getFormControlValue(form,'status');
      this.userRoles = Utils.getFormControlValue(form,'userRoles');
    } else {
      this.id = form;
    }
  }
}

export class ExternalUserRoleModel extends RoleDetailModel {
  userName: string = '';
  roleId: number = -1;
  roleName: string = '';
  organizationId: number = -1;
  organizationName: string = '';
}
