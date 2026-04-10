import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class ModuleModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  path: string | null = null;
  color: string | null = null;
  icon: string | null = null;
  iconName: string | null = null;
  orderNumber: number | null = null;
  img?: string;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if(form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.path = Utils.getFormControlValue(form, 'path');
      this.color = Utils.getFormControlValue(form, 'color');
      this.icon = Utils.getFormControlValue(form, 'icon');
      this.iconName = Utils.getFormControlValue(form, 'iconName');
      this.orderNumber = Utils.getFormControlValue(form, 'orderNumber');
      this.status = Utils.getFormControlValue(form, 'status');
    } else {
      this.id = form;
    }
  }
}
