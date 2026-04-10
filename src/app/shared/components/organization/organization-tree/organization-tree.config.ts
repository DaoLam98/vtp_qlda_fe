import {Config} from "src/app/common/models/config.model";
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'organization',
  filterForm: [
    {
      name: 'code',
      label: 'Mã',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'name',
      label: 'Tên',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
  ],
  tableField: 'id,code,name,orgForm,sapId,parentEntity.name,path,pathName',
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
}
