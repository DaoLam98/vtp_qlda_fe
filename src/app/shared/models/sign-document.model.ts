import { BaseModel, SelectModel } from "@c10t/nice-component-library";
import { StaffModel } from "src/app/modules/mdm/_models/config-vo.model";

export class SignDocumentModel extends BaseModel {
  configVoId: number | null = null; // Luồng ký
  code: string | null = null; // Số hiệu
  title: string | null = null; // Trích yếu
  description: string | null = null; // Mô tả
  typeId: number | null = null; // Hình thức văn bản
  areaId: number | null = null; // Ngành
  priorityId: number | null = null; // Độ khẩn
  sTypeId: number | null = null; // Độ mật
  autoPromulgateText: 1 | 0 = 0; // Ban hành tự động
  lstFileSign: FileSignModel[] = []; // File trình ký
  listFileSignOther: FileSignModel[] = []; // File phụ lục
  lstFileSigned: FileSignModel[] = []; // File trình ký đã ký
  listFileSignedOther: FileSignModel[] = []; // File phụ lục đã ký
  officePublishedId: number | null = null; // Id của Đơn vị được tick Ban hành trong bảng Danh sách cá nhân ký duyệt
  lstStaff: LstStaffModel[] = []; // Danh sách cá nhân ký duyệt
  isActive: boolean = false; // BE tự truyền
  voStatus: string | null = null; // Trạng thái trình ký
  signVofficeDate: string | null = null; // Ngày ký văn bản
  isSignParallel: boolean | null = null; // Ký song song hay ký tuần tự

  constructor(form: Record<string, any>) {
    super();

    if (form) {
      this.initializeBasicProperties(form);
      this.initializeFileSignProperties(form);
      this.initializeStaffList(form);
    }
  }

  private initializeBasicProperties(form: any): void {
    this.configVoId = form?.configVoId != -1 ? form?.configVoId : null;
    this.code = form?.code;
    this.title = form?.title;
    this.description = form?.description;
    this.typeId = form?.typeId;
    this.areaId = form?.areaId;
    this.priorityId = form?.priorityId;
    this.sTypeId = form?.sTypeId;
    this.autoPromulgateText = form?.autoPromulgateText ? 1 : 0;
    this.signVofficeDate = form?.signVofficeDate;
  }

  private initializeFileSignProperties(form: any): void {
    this.lstFileSign = this.mapFileSignList(form?.lstFileSign, 'MAIN_DOCUMENT');
    this.listFileSignOther = this.mapFileSignList(form?.listFileSignOther, 'ATTACHMENT');
    this.lstFileSigned = form?.lstFileSigned || [];
    this.listFileSignedOther = form?.listFileSignedOther || [];
  }

  private mapFileSignList(files: any[] | undefined, type: 'MAIN_DOCUMENT' | 'ATTACHMENT'): any[] {
    return (
      files?.map((file: any, index: number) => ({
        type,
        name: file.name,
        fileOrder: index,
      })) || []
    );
  }

  private initializeStaffList(form: any): void {
    const lstStaff = form?.lstStaff;
    this.isSignParallel = form?.isSignParallel;

    this.lstStaff = lstStaff?.map((staff: StaffModel, index: number) => {
      if (staff.isPromulgate) {
        this.officePublishedId = staff.departmentSignId;
      }

      return this.createStaffSignInfo(staff, index, !!this.isSignParallel);
    });
  }

  private createStaffSignInfo(staff: StaffModel, index: number, isParallelSign: boolean): any {
    const { staffOptions, departmentSignOptions, ...rest } = staff;
    const selectedDepartment = departmentSignOptions?.find(
      (department: SelectModel) => department.rawData.orgId === staff.departmentSignId,
    );

    return {
      ...rest,
      id: null,
      signImage: staff.signImage ? 1 : 0,
      signLevelParallel: staff.signLevelParallel || null,
      signLevel: isParallelSign
        ? staff.signLevelParallel
          ? (staff.signLevelParallel || 0) - 1
          : staff.signLevel
        : index,
      isPromulgate: staff.isPromulgate ? 1 : 0,
      departmentName: selectedDepartment?.rawData?.orgName,
    };
  }
}

export class FileSignModel extends BaseModel {
  name: string | null = null;
  type: 'MAIN_DOCUMENT' | 'ATTACHMENT' | null = null;
  fileOrder: number | null = null;
  filePathVss: string | null = null;
  filePath: string | null = null;

  constructor() {
    super();
  }
}

export class LstStaffModel extends BaseModel {
  signDocumentId: number | null = null;
  staffId: number | null = null;
  staffFullName: string | null = null;
  staffCode: string | null = null;
  configVoStaffId: number | null = null;
  signLevel: number | null = null;
  signImage: number | null = null;
  signImageId: number | null = null;
  signImageName: string | null = null;
  departmentName: string | null = null;
  departmentSignId: number | null = null;
  userRoleId: number | null = null;
  jobPositions: { id: number }[] = [];
  isPromulgate: boolean | null = null;
  // [key: string]: any;
}
