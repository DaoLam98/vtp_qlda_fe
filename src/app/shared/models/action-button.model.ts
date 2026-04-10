import {DocumentType, HistoryType} from 'src/app/shared/enums/history-type.enum';
import {BaseModel, FlatTreeNodeModel} from '@c10t/nice-component-library';
import {FormGroup} from "@angular/forms";
import {StaffModel} from "src/app/modules/mdm/_models/config-vo.model";

export interface FileSignModel {
  id: number;
  type: DocumentType;
  filePathVss: string;
  name: string;
  fileOrder: number;
  signDocumentId: number;
  createdDate: string;
  createdBy: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
}

export interface fileSignDocumentTreeModel {
  id: number;
  index: number;
  code: string;
  title: string;
  voStatus: string;
  lstFileSign: FileSignModel[];
  lstFileSigned: FileSignModel[];
  listFileSignOther: FileSignModel[];
  listFileSignedOther: FileSignModel[];
  createdDate: string;
  createdBy: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
  status: string;
}

export interface ExtendedFlatTreeNodeModel extends FlatTreeNodeModel {
  rawData?: FileSignModel;
  parentId?: number
}

export class PopUpModel extends BaseModel {
  stepName?: number;
  endDate?: string | null = '';
  status?: string | null = '';
  dueDate?: string | null = '';
  title: string | null = '';
  code: string | null = '';
  voStatus?:  string | null = '';
  creatorName: string | null = '';
  creatorCode: string | null = '';
  signComment: string | null = '';
  lstStaff: StaffModel[] = [];

  constructor(form: FormGroup | number) {
    super();
    if (form instanceof FormGroup) {
      const get = (key: string) => form.get(key)?.value;
      this.stepName = get('stepName');
      this.status = get('status');
      this.createdDate = get('createdDate');
      this.title = get('title');
      this.code = get('code');
      this.creatorName = get('creatorName');
      this.creatorCode = get('creatorCode');
      this.signComment = get('signComment');
      this.lstStaff = get('lstStaff')
    } else {
      this.id = form;
    }
  }
}
