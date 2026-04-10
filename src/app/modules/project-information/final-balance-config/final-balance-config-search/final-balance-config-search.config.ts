import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'final-balance-config',
  filterForm: [
    {
      name: 'projectId',
      label: 'projectId',
      type: FieldType.COMBOBOX,
      validate: [],
    },
    {
      name: 'informationTypeId',
      label: 'informationTypeId',
      type: FieldType.COMBOBOX,
      validate: [],
    },
    {
      name: 'targetGroups.targetGroupId',
      label: 'targetGroups.targetGroupId',
      type: FieldType.COMBOBOX,
      validate: [],
    },
    {
      name: 'cycleId',
      label: 'cycleId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: true,
      validate: [],
    },
  ],
  sortBy: 'createdDate',
  sortDirection: 'desc',
};
