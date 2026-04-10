import {Validators} from "@angular/forms";
import {Config} from "src/app/common/models/config.model";
import {FieldType} from "src/app/common/models/field.model";
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'organization',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      validate: [Validators.required]
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      validate: ['']
    },
    {
      name: 'email',
      label: 'email',
      type: FieldType.TEXT,
      required: false,
      isHidden: true,
      validate: ['']
    },
    {
      name: 'phoneNumber',
      label: 'phoneNumber',
      type: FieldType.NUMBER,
      required: false,
      isHidden: true,
      validate: ['']
    },
    {
      name: 'gender',
      label: 'gender',
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
    }
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
}
