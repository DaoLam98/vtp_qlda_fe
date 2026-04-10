import {Validators} from '@angular/forms';
import {Config} from 'src/app/common/models/config.model';
import {FieldType} from 'src/app/common/models/field.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'external-user',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      validate: [Validators.required],
    },
    {
      name: 'fullName',
      label: 'fullName',
      type: FieldType.TEXT,
      required: false,
      validate: [''],
    },
    {
      name: 'email',
      label: 'email',
      type: FieldType.TEXT,
      required: false,
      isHidden: true,
      validate: [''],
    },
    {
      name: 'phoneNumber',
      label: 'phoneNumber',
      type: FieldType.TEXT,
      required: false,
      isHidden: true,
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
      name: 'organizationId',
      label: 'organizationId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [''],
    },
    {
      name: 'gender',
      label: 'gender',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [''],
    },
    {
      name: 'dob',
      label: 'dob',
      type: FieldType.DATE_RANGE,
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
