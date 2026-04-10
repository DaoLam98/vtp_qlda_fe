import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'cycle-management',
  filterForm: [
    {
      name: 'periodCode',
      label: 'periodCode',
      type: FieldType.TEXT,
      validate: [],
    },
    {
      name: 'startDate',
      label: 'startDate',
      type: FieldType.DATE_RANGE,
      validate: [],
    },
    {
      name: 'endDate',
      label: 'endDate',
      type: FieldType.DATE_RANGE,
      validate: [],
    },
    {
      name: 'cycleStatus',
      label: 'cycleStatus',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [],
    },
  ],
  sortBy: 'startDate',
  sortDirection: 'asc',
};
