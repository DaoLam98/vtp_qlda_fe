import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {OrganizationModel} from './organization.model';
import {RoleDetailModel} from './role.model';
import {Utils} from "src/app/shared/utils/utils";

export class JobPositionModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  jobPositionGroupId: number | null = null;
  organizations: OrganizationModel[] = [];
  roles: RoleDetailModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.jobPositionGroupId = Utils.getFormControlValue(form, 'jobPositionGroupId');
      this.organizations = Utils.getFormControlValue(form, 'organizations');
      this.roles = Utils.getFormControlValue(form, 'roles');
    } else {
      this.id = form;
    }
  }
}
