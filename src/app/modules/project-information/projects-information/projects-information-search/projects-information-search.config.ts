import {Config} from "src/app/common/models/config.model";
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";
import {FieldType} from "src/app/common/models/field.model";
import {Validators} from "@angular/forms";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'project',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [Validators.required],
    },
    {
      name: 'sapCode',
      label: 'sapCode',
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
      name: 'sapCode',
      label: 'sapCode',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'investmentForm',
      label: 'investmentForm',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'proposingOrgId',
      label: 'proposingOrgId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'investmentFormId',
      label: 'investmentFormId',
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
}
