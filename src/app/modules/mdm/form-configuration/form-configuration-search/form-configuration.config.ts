import {Config} from 'src/app/common/models/config.model';
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'expression',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'expressionTypeId',
      label: 'expressionTypeId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'informationTypeId',
      label: 'informationTypeId',
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
