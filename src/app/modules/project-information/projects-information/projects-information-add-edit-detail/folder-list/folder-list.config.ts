import {Config} from "src/app/common/models/config.model";
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'project-archive',
  isPopupViewEdit: true,
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'parentName',
      label: 'parentName',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'archiveType',
      label: 'archiveType',
      type: FieldType.COMBOBOX,
      required: false,
      validate: []
    },
  ],
  tableField: 'id,code,archiveType,name,parentEntity.name,parentEntity.parentName,filePath,fileName,status,pathName,canUpdate,canDelete'
}
