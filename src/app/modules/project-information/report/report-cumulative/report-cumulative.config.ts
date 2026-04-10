import { Validators } from '@angular/forms';
import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'report',
  filterForm: [
    {
      name: 'organizationIds',
      label: 'organizationIds',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
      isMultiSelect: true,
    },
    {
      name: 'projectTypeIds',
      label: 'projectTypeIds',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
      isMultiSelect: true,
    },
    {
      name: 'projectIds',
      label: 'projectIds',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
      isMultiSelect: true,
    },
    {
      name: 'expressionInformationTypeId',
      label: 'expressionInformationTypeId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [Validators.required],
    },
    {
      name: 'startDate',
      label: 'startDate',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [Validators.required],
    },
    {
      name: 'endDate',
      label: 'endDate',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [Validators.required],
    },
    {
      name: 'isConsolidated',
      label: 'isConsolidated',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
    },
  ],
  isOnlyViewTable: true,
};
