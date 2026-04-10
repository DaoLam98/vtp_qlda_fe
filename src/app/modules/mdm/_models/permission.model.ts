import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class PermissionModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  parentId: string | null = null;   // ID quyền cha
  parentName: string | null = null; // Tên quyền cha
  parentCode: string | null = null; // Mã quyền cha
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' | string | undefined = undefined;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form,'code');
      this.name = Utils.getFormControlValue(form,'name');
      this.description = Utils.getFormControlValue(form,'description');
      this.parentId = Utils.getFormControlValue(form,'parentId');
      this.parentName = Utils.getFormControlValue(form,'parentName');
      this.parentCode = Utils.getFormControlValue(form,'parentCode');
      this.status = Utils.getFormControlValue(form,'status');
    } else {
      this.id = form;
    }
  }
}
