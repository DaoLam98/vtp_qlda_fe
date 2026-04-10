import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export enum LocationType {
  COUNTRY = 'COUNTRY',
  WARD = 'WARD',
  PROVINCE = 'PROVINCE',
  DISTRICT = 'DISTRICT',
  LAND = 'LAND',
  IS_LAND = 'IS_LAND',
}

export class LocationModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  parentId: number | null = null
  parentName: string | null = null;
  parentCode: string | null = null;
  locationLevel: LocationType = LocationType.COUNTRY;
  osmBoundaryId: string | null = null;
  path: string | null = null;
  pathName: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();
    if(form instanceof FormGroup) {
      this.id = Utils.getFormControlValue(form, 'id');
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      const parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentId = parentId !== -1 ? parentId : null;
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.parentCode = Utils.getFormControlValue(form, 'parentCode');
      this.locationLevel = Utils.getFormControlValue(form, 'locationLevel');
      this.osmBoundaryId = Utils.getFormControlValue(form, 'osmBoundaryId');
      this.path = Utils.getFormControlValue(form, 'path');
      this.pathName = Utils.getFormControlValue(form, 'pathName');
      this.status = Utils.getFormControlValue(form, 'status');
    } else {
      this.id = form;
    }
  }
}
