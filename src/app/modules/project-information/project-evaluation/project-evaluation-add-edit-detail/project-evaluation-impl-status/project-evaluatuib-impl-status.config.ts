import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'project-evaluation',
  filterForm: [
    {
      name: 'target',
      label: 'target',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'reportName',
      label: 'reportName',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'evaluationStartDate',
      label: 'evaluationStartDate',
      type: FieldType.DATE_RANGE,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'evaluationEndDate',
      label: 'evaluationEndDate',
      type: FieldType.DATE_RANGE,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
    },
  ],
  sortBy: 'lastModifiedDate',
  sortDirection: 'desc',
};
