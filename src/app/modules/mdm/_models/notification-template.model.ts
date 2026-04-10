import {FormGroup} from '@angular/forms';
import {BaseModel} from '@c10t/nice-component-library';
import {Utils} from "src/app/shared/utils/utils";

export enum NotificationTemplateTypeEnum {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  NOTIFICATION = 'NOTIFICATION',
}

export class NotificationTemplateModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  menuId: string | null = null;
  menuName: string | null = null;
  menuCode: string | null = null;
  content: string | null = null;
  type: NotificationTemplateTypeEnum = NotificationTemplateTypeEnum.EMAIL;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      const isNotificationTemplateMenuType = Utils.getFormControlValue(form,'type') === NotificationTemplateTypeEnum.NOTIFICATION;
      this.code = Utils.getFormControlValue(form,'code');
      this.name = Utils.getFormControlValue(form,'name');
      this.description = Utils.getFormControlValue(form,'description');
      this.type = Utils.getFormControlValue(form,'type');
      this.menuId = isNotificationTemplateMenuType ? Utils.getFormControlValue(form,'menuId') : null;
      this.menuName = isNotificationTemplateMenuType ? Utils.getFormControlValue(form,'menuName') : null;
      this.menuCode = isNotificationTemplateMenuType ? Utils.getFormControlValue(form,'menuCode') : null;
      this.content = Utils.getFormControlValue(form,'content');
      this.status = Utils.getFormControlValue(form,'status');
    } else {
      this.id = form;
    }
  }
}
