import {Config} from 'src/app/common/models/config.model';
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'translation-key',
  filterForm: [
    {
      name: 'key',
      label: 'key',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'module',
      label: 'module',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
};
