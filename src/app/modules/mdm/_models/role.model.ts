import {BaseModel} from "@c10t/nice-component-library";
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";

export class RoleDetailModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  permissions: PermissionModel[] = [];
  menus: MenuModel[] = [];

  constructor(form: FormGroup | number) {
    super();

    if(form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');

      const permissions = Utils.getFormControlValue(form, 'permissions');
      this.permissions = permissions.filter((permissionId: any) => permissionId !== "_ALL").map((permissionId: number) => ({id: permissionId}));

      const menus = Utils.getFormControlValue(form, 'menus');
      this.menus = menus.filter((menuId: any) => menuId !== "_ALL").map((menuId: number) => ({id: menuId}));
    } else {
      this.id = form;
    }
  }
}

export class PermissionModel extends BaseModel {
  id: number = -1;
  index: number = -1;
  keyword: string = '';
  status: string = '';
  code: string = '';
  description: string = '';
  name: string = '';
}

export class MenuModel extends PermissionModel {
  moduleId: number = -1;
  type: string = '';
  url: string = '';
}
