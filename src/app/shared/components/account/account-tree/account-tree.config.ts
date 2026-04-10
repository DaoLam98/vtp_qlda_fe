import {Config} from 'src/app/common/models/config.model';
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'accounting-account',
  filterForm: [
    {
      name: 'accountNumber',
      label: 'Số tài khoản',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'name',
      label: 'Tên tài khoản',
      type: FieldType.TEXT,
      required: false,
      validate: []
    },
    {
      name: 'parentId',
      label: 'Tài khoản cha',
      type: FieldType.COMBOBOX,
      required: false,
      validate: [''],
      isHidden: false,
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
}
