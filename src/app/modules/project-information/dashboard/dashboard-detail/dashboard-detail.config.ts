import {Config} from "src/app/common/models/config.model";
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";
import {FieldType} from "src/app/common/models/field.model";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'dashboard',
  filterForm: [
    {
      name: 'projectTypeId',
      label: 'projectTypeId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'projectId',
      label: 'projectId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'organizationId',
      label: 'organizationId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'fromDate',
      label: 'fromDate',
      type: FieldType.DATE,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'toDate',
      label: 'toDate',
      type: FieldType.DATE,
      required: false,
      isHidden: false,
      validate: [''],
    },
  ]
}
