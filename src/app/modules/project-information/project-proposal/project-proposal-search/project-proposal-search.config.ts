import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'project-proposal',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'name',
      label: 'name',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'proposingOrgId',
      label: 'proposingOrgId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'projectProposalStatus',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
    },
    {
      name: 'investmentFormId',
      label: 'investmentFormId',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [],
    },
  ],
  sortBy: 'lastModifiedDate',
  sortDirection: 'desc',
};
