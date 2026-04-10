import {BaseModel} from "@c10t/nice-component-library";

export class HashTagDetailModel extends BaseModel {
  id: number = -1;
  index: number = -1;
  keyword: string = '';
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
  name: string = '';
  code: string = '';
  description: string = '';
  organizationIds: number[] = [];
  createdDate: string = '';
  createdBy: string = '';
  lastModifiedDate: string = '';
  lastModifiedBy: string = '';

  constructor() {
    super();
  }
}


export class HashTagRequestModel {
  name: string = '';
  code: string = '';
  description: string = '';
  organizationIds: number[] = [];
  other: string = '';

  constructor(init?: Partial<HashTagRequestModel>) {
    if (init) {
      Object.keys(init).forEach(key => {
        if (key in this) {
          if(key === 'organizationIds') {
            const organizations = init[key];
            if (Array.isArray(organizations)) {
                (this as any)[key] = organizations.map((org: any) => org.id);
            }
          } else {
            (this as any)[key] = init[key as keyof HashTagRequestModel];
          }
        }
      });
    }
  }
}
