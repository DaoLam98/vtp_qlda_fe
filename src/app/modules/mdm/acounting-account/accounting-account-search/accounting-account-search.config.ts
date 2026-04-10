import { Validators } from '@angular/forms';
import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'accounting-account',
  filterForm: [
    {
      name: 'accountNumber',
      label: 'accountNumber',
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
  ]
}
