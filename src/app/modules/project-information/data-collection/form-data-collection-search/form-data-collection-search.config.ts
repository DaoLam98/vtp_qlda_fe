import { Config } from 'src/app/common/models/config.model';
import { FieldType } from 'src/app/common/models/field.model';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.PROJECT,
  name: 'data-gathering',
  filterForm: [
    {
      name: 'projectId',
      label: 'projectName',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'organizationId',
      label: 'organizationName',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'expressionInformationTypeId',
      label: 'expressionInformationTypeName',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'dataGatheringStatus',
      label: 'dataAggregationStatus',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
  ],
  sortBy: 'lastModifiedDate',
  sortDirection: 'desc'
};

export const mapStatus = [{
  displayValue: 'Đang cập nhật',
  value: 'IN_PROGRESS'
},
{
  displayValue: 'Chờ xác nhận',
  value: 'WAITING'
},
{
  displayValue: 'Đã xác nhận',
  value: 'APPROVED'
},
{
  displayValue: 'Bị từ chối',
  value: 'REJECTED'
}]