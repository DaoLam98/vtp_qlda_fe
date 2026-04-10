import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from 'src/app/shared/utils/utils';

export class OrganizationModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  parentId: number | null = null;
  parentName: string | null = null;
  address: string | null = null;
  latitude: number | null = null;
  longitude: number | null = null;
  path: string | null = null;
  type: string | null = null;
  orgForm: 'DEPENDENT' | 'INDEPENDENT' = 'DEPENDENT';
  currencyId: number | null = null;
  sapId: number | null = null;
  description: number | null = null;
  businessArea?: string;
  costCenter?: string;
  status: 'ACCEPTED' | 'DRAFT' | 'REJECTED' = 'ACCEPTED';
  assetGroups: [] = []
  assetGr: [] = []
  organizationId: number | null = null;
  organizationCode: string | null = null;
  organizationName: string | null = null;
  organizationDescription: string | null = null;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.address = Utils.getFormControlValue(form, 'address');
      this.latitude = Utils.getFormControlValue(form, 'latitude');
      this.longitude = Utils.getFormControlValue(form, 'longitude');
      this.path = Utils.getFormControlValue(form, 'path');
      this.status = Utils.getFormControlValue(form, 'status');
      this.type = Utils.getFormControlValue(form, 'type');
      this.orgForm = Utils.getFormControlValue(form, 'orgForm');
      this.currencyId = Utils.getFormControlValue(form, 'currencyId');
      this.sapId = Utils.getFormControlValue(form, 'sapId');
      this.businessArea = Utils.getFormControlValue(form, 'businessArea');
      this.costCenter = Utils.getFormControlValue(form, 'costCenter');
      this.organizationDescription = Utils.getFormControlValue(form, 'organizationDescription');
    } else {
      this.id = form;
    }
  }
}
