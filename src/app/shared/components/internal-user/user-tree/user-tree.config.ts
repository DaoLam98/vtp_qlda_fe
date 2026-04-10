import {Validators} from "@angular/forms";
import {Config} from "src/app/common/models/config.model";
import {FieldType} from "src/app/common/models/field.model";
import {ModuleNameEnum} from "src/app/shared/enums/module.name.enum";

const filterForm = [
  {
    name: 'code',
    label: 'code',
    type: FieldType.TEXT,
    required: false,
    validate: [Validators.required]
  },
  {
    name: 'fullName',
    label: 'fullName',
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
    type: FieldType.TEXT,
    required: false,
    isHidden: true,
    validate: ['']
  },
  {
    name: 'jobPositionId',
    label: 'jobPositionId',
    type: FieldType.COMBOBOX,
    required: false,
    isHidden: true,
    validate: ['']
  },
];

export const INTERNAL_USER_FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'internal-user',
  filterForm: filterForm,
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc' // asc là của status, desc là của lastModifiedDate
}

export const EXTERNAL_USER_FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'external-user',
  filterForm: filterForm,
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc' // asc là của status, desc là của lastModifiedDate
}
