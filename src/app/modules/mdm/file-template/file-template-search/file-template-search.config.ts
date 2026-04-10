import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {inject} from "@angular/core";
import {SelectModel} from "@c10t/nice-component-library";
import {TranslateService} from "@ngx-translate/core";
import {FieldType} from "src/app/common/models/field.model";

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'file-template',
  filterForm: [
    {
      name: 'code',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'name',
      label: 'code',
      type: FieldType.TEXT,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'type',
      label: 'type',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
};

export function getTypeValues(hasDefaultOption: boolean = false): SelectModel[] {
  const translate = inject(TranslateService);
  return [
    ...(hasDefaultOption ? [{
      value: -1,
      disabled: false,
      displayValue: "common.combobox.option.default",
      rawData: -1,
    }] : []),
    {
      displayValue: translate.instant('mdm.file-template.type.option.import'),
      value: 'IMPORT',
      rawData: 'IMPORT',
      disabled: false
    },
    {
      displayValue: translate.instant('mdm.file-template.type.option.export'),
      value: 'EXPORT',
      rawData: 'EXPORT',
      disabled: false
    },
  ];
}
