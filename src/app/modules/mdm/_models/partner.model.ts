import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class PartnerModel extends BaseModel {
  code: string = '';
  name: string = '';
  email: string = '';
  address: string = '';
  phoneNumber: string = '';
  description: string = '';
  representName: string = '';
  representIdentifyType: string = '';
  representIdentifyNumber: string = '';
  representIdentifyDate: string = '';
  representIdentifyAddress: string = '';
  representPhone: string = '';
  representEmail: string = '';
  representResidenceAddress: string = '';
  representContactAddress: string = '';
  representGender: string = '';
  representPosition: string = '';
  representBirthday: string = '';
  partnerPayments: null | undefined = undefined;
  organizations: null | undefined = undefined;
  externalUsers: null | undefined = undefined;
  contactPhone: null | undefined = undefined;
  contactName: null | undefined = undefined;
  contactEmail: null | undefined = undefined;
  taxNumber: number | null | undefined = undefined;
  type: 'INDIVIDUAL' | 'BUSINESS' | string | undefined = undefined;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' | string | undefined = undefined;
  pathFile: string = '';
  fileName: string = '';

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.type = Utils.getFormControlValue(form, 'type');
      this.email = Utils.getFormControlValue(form, 'email');
      this.taxNumber = Utils.getFormControlValue(form, 'taxNumber');
      this.status = Utils.getFormControlValue(form, 'status');
      this.representName = Utils.getFormControlValue(form, 'representName');
      this.representIdentifyType = Utils.getFormControlValue(form, 'representIdentifyType');
      this.representIdentifyNumber = Utils.getFormControlValue(form, 'representIdentifyNumber');
      this.representIdentifyDate = Utils.getFormControlValue(form, 'representIdentifyDate');
      this.representIdentifyAddress = Utils.getFormControlValue(form, 'representIdentifyAddress');
      this.representPhone = Utils.getFormControlValue(form, 'representPhone');
      this.representEmail = Utils.getFormControlValue(form, 'representEmail');
      this.representResidenceAddress = Utils.getFormControlValue(form, 'representResidenceAddress');
      this.representContactAddress = Utils.getFormControlValue(form, 'representContactAddress');
      this.representGender = Utils.getFormControlValue(form, 'representGender');
      this.representPosition = Utils.getFormControlValue(form, 'representPosition');
      this.representBirthday = Utils.getFormControlValue(form, 'representBirthday');
      this.partnerPayments = Utils.getFormControlValue(form, 'partnerPayments');
      this.organizations = Utils.getFormControlValue(form, 'organizations');
      this.externalUsers = Utils.getFormControlValue(form, 'externalUsers');
      this.contactPhone = Utils.getFormControlValue(form, 'contactPhone');
      this.contactName = Utils.getFormControlValue(form, 'contactName');
      this.contactEmail = Utils.getFormControlValue(form, 'contactEmail');
      this.pathFile = Utils.getFormControlValue(form, 'pathFile');
    } else {
      this.id = form;
    }
  }
}
