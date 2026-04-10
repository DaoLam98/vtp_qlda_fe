import {Validators} from '@angular/forms';
import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {FieldType} from 'src/app/common/models/field.model';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'investment-limit',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [Validators.required]
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'limitAmount',
      label: 'limitAmount',
      type: FieldType.NUMBER,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'currencyId',
      label: 'currencyId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: ['']
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: ['']
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
};
