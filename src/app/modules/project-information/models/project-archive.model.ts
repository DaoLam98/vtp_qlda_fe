import {BaseModel} from '@c10t/nice-component-library';
import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export type Status = 'APPROVED' | 'DRAFT' | 'REJECTED';
export type ArchiveType = 'FOLDER' | 'FILE';

export class ProjectArchiveModel extends BaseModel {
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;

  parentId: number | null = null;
  parentCode: string | null = null;
  parentName: string | null = null;

  projectId: number | null = null;
  projectCode: string | null = null;
  projectName: string | null = null;
  projectArchives: ProjectArchivesModel[] = [];


  archiveType: ArchiveType = 'FOLDER';
  path: string | null = null;
  pathName: string | null = null;
  filePath: string | null = null;
  fileName: string | null = null;
  sequenceNo: number | null = null;
  status: Status = 'APPROVED';
  canDelete: boolean = false;
  canUpdate: boolean = false;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentCode = Utils.getFormControlValue(form, 'parentCode');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.projectArchives = Utils.getFormControlValue(form, 'projectArchives')
      this.archiveType = Utils.getFormControlValue(form, 'archiveType');
      this.path = Utils.getFormControlValue(form, 'path');
      this.pathName = Utils.getFormControlValue(form, 'pathName');
      this.filePath = Utils.getFormControlValue(form, 'filePath');
      this.fileName = Utils.getFormControlValue(form, 'fileName');
      this.sequenceNo = Utils.getFormControlValue(form, 'sequenceNo', 0);
      this.canDelete = Utils.getFormControlValue(form, 'canDelete');
      this.canUpdate = Utils.getFormControlValue(form, 'canUpdate');
    } else {
      this.id = form;
    }
  }
}

export class ProjectArchivesModel extends BaseModel {
  id: number | null = null;
  index: number | null = null;
  keyword: string | null = null;
  status: Status = 'DRAFT';
  code: string | null = null;
  name: string | null = null;
  description: string | null = null;
  parentId: number | null = null;
  parentCode: string | null = null;
  parentName: string | null = null;
  projectId: number | null = null;
  projectCode: string | null = null;
  projectName: string | null = null;
  archiveType: ArchiveType = 'FOLDER';
  path: string | null = null;
  pathName: string | null = null;
  filePath: string | null = null;
  fileName: string | null = null;
  sequenceNo: number = 0;

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      this.code = Utils.getFormControlValue(form, 'code');
      this.name = Utils.getFormControlValue(form, 'name');
      this.description = Utils.getFormControlValue(form, 'description');
      this.status = Utils.getFormControlValue(form, 'status');
      this.parentId = Utils.getFormControlValue(form, 'parentId');
      this.parentCode = Utils.getFormControlValue(form, 'parentCode');
      this.parentName = Utils.getFormControlValue(form, 'parentName');
      this.projectId = Utils.getFormControlValue(form, 'projectId');
      this.projectCode = Utils.getFormControlValue(form, 'projectCode');
      this.projectName = Utils.getFormControlValue(form, 'projectName');
      this.archiveType = Utils.getFormControlValue(form, 'archiveType');
      this.path = Utils.getFormControlValue(form, 'path');
      this.pathName = Utils.getFormControlValue(form, 'pathName');
      this.filePath = Utils.getFormControlValue(form, 'filePath');
      this.fileName = Utils.getFormControlValue(form, 'fileName');
      this.sequenceNo = Utils.getFormControlValue(form, 'sequenceNo');
    } else {
      this.id = form;
    }
  }
}
