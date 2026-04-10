import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {FieldType} from 'src/app/common/models/field.model';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'config-schedule-job',
  filterForm: [
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'cron',
      label: 'cron',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'isOneTime',
      label: 'isOneTime',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
  ],
  sortBy: 'lastModifiedDate',
};
