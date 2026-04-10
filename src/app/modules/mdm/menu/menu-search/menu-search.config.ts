import {Validators} from '@angular/forms';
import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {FieldType} from "src/app/common/models/field.model";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'menu',
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
      name: 'url',
      label: 'url',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'moduleId',
      label: 'moduleId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'useForWebsite',
      label: 'useForWebsite',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'useForMobile',
      label: 'useForMobile',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
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
