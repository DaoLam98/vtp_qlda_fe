import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {FieldType} from "src/app/common/models/field.model";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'notification-template',
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
      name: 'content',
      label: 'content',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'menuId',
      label: 'menu',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'type',
      label: 'type',
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
