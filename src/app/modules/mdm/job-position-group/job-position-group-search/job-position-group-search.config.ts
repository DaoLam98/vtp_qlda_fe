import {Validators} from '@angular/forms';
import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {FieldType} from "src/app/common/models/field.model";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'job-position-group',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      validate: [Validators.required],
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      validate: [''],
    },
    {
      name: 'type',
      label: 'type',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [''],
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [''],
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
};
