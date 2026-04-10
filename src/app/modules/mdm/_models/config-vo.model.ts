import {BaseModel, SelectModel} from '@c10t/nice-component-library';
import {OrganizationModel} from 'src/app/modules/mdm/_models/organization.model';
import {FormGroup} from "@angular/forms";
import {Utils} from "src/app/shared/utils/utils";

function transformStaffData(staff: any, index: number, hasSignLevelParallel: boolean): any {
  const jobPositions = filterAndTransformJobPositions(staff.jobPositions);

  return {
    ...staff,
    jobPositions,
    staffId: staff.staffId === -1 ? null : staff.staffId,
    signLevel: index + 1,
    signLevelParallel: hasSignLevelParallel ? staff.signLevelParallel : null,
    signImage: staff.signImage ? 1 : 0,
  };
}

function filterAndTransformJobPositions(jobPositions: number[] = []): { id: number }[] {
  return jobPositions
    .filter((id: number) => id !== -1)
    .map((id: number) => ({ id }));
}

export class ConfigVOModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;

  code: string | null = null;
  title: string | null = null;
  typeId: number | null = null;
  areaId: number | null = null;
  priorityId: number | null = null;
  stypeId: number | null = null;
  menuId: number | null = null;
  menuCode: string | null = null;
  menuName: string | null = null;

  description: string | null = null;
  autoPromulgateText: boolean = false;
  canAdd: boolean = false;
  lstStaff: StaffModel[] = [];
  organizations: OrganizationModel[] = [];
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';

  constructor(form: FormGroup | number) {
    super();

    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form,'code');
      this.title = Utils.getFormControlValue(form,'title');
      this.typeId = Utils.getFormControlValue(form,'typeId');
      this.areaId = Utils.getFormControlValue(form,'areaId');
      this.priorityId = Utils.getFormControlValue(form,'priorityId');
      this.stypeId = Utils.getFormControlValue(form,'stypeId');
      this.menuId = Utils.getFormControlValue(form,'menuId');
      this.menuCode = Utils.getFormControlValue(form,'menuCode');
      this.menuName = Utils.getFormControlValue(form,'menuName');
      this.description = Utils.getFormControlValue(form,'description');
      this.autoPromulgateText = Utils.getFormControlValue(form,'autoPromulgateText', false);
      this.canAdd = Utils.getFormControlValue(form,'canAdd', false);
      this.status = Utils.getFormControlValue(form,'status');

      const organizations = Utils.getFormControlValue(form,'organizations');
      this.organizations = organizations?.map((organization: any) => ({ id: organization.id }));

      const hasSignLevelParallel = Utils.getFormControlValue(form,'signLevelParallel');
      const lstStaff = Utils.getFormControlValue(form,'lstStaff');
      this.lstStaff = lstStaff?.map((staff: any, index: number) =>
        transformStaffData(staff, index, hasSignLevelParallel),
      );
    } else {
      this.id = form;
    }
  }
}

export class StaffModel extends BaseModel {
  keyword: string | null = null;
  status: string | null = null;
  signLevel: number | null = null;
  signLevelParallel: number | null = null;
  positionId: number | null = null;
  positionName: string | null = null;
  positionCode: string | null = null;
  jobPositions: { id: number }[] = [];
  staffId: number | null = null;
  staffCode: string | null = null;
  staffFullName: string | null = null;
  configVoId: number | null = null;
  configVoCode: string | null = null;
  configVoTitle: string | null = null;
  isRequire: boolean = false;
  signImage: boolean = false;
  isPromulgate: boolean = false;
  signDocumentId: number | null = null;
  signImageId: number | null = null;
  signImageName: number | null = null;
  departmentName: string | null = null; // Sử dụng ở Tab Trình ký của Kế hoạch công tác
  departmentSignId: number | null = null; // Sử dụng ở Tab Trình ký của Kế hoạch công tác
  departmentSignName: string | null = null; // Sử dụng ở Tab Trình ký của Kế hoạch công tác
  signatureId: number | null = null; // ID ảnh ký
  staffOrganizationId: number | null = null; // ID của đơn vị của nhân viên
  staffOrganizationName: string | null = null; // Mã của đơn vị của nhân viên
  staffOrganizationCode: number | null = null; // Mã của đơn vị của nhân viên
  staffOptions?: SelectModel[] = [];
  [s: string]: any
}
