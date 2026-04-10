import {Config} from 'src/app/common/models/config.model';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {SelectModel} from '@c10t/nice-component-library';
import {FieldType} from 'src/app/common/models/field.model';

export const FORM_CONFIG: Config = {
  moduleName: ModuleNameEnum.MDM,
  name: 'attribute',
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
      name: 'datatype',
      label: 'dataType',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'require',
      label: 'requiredInput',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: ['']
    },
    {
      name: 'referenceTable',
      label: 'connectedTable',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
    {
      name: 'status',
      label: 'status',
      type: FieldType.COMBOBOX,
      required: false,
      isHidden: false,
      validate: [''],
    },
  ],
  sortBy: 'status,lastModifiedDate',
  sortDirection: 'asc,desc'
};

export enum attributeDatatypeEnum {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  REFERENCE = 'REFERENCE',
}

export const getDatatypeOptions = (hasDefaultOption: boolean = false): SelectModel[] => {
  return [
    ...(hasDefaultOption ? [{
      value: -1,
      disabled: false,
      displayValue: "common.combobox.option.default",
      rawData: -1,
    }] : []),
    {
      displayValue: `${FORM_CONFIG.moduleName}.${FORM_CONFIG.name}.form.dataType.option.string`,
      value: attributeDatatypeEnum.STRING,
      rawData: attributeDatatypeEnum.STRING,
      disabled: false
    },
    {
      displayValue: `${FORM_CONFIG.moduleName}.${FORM_CONFIG.name}.form.dataType.option.number`,
      value: attributeDatatypeEnum.NUMBER,
      rawData: attributeDatatypeEnum.NUMBER,
      disabled: false
    },
    {
      displayValue: `${FORM_CONFIG.moduleName}.${FORM_CONFIG.name}.form.dataType.option.date`,
      value: attributeDatatypeEnum.DATE,
      rawData: attributeDatatypeEnum.DATE,
      disabled: false
    },
    {
      displayValue: `${FORM_CONFIG.moduleName}.${FORM_CONFIG.name}.form.dataType.option.boolean`,
      value: attributeDatatypeEnum.BOOLEAN,
      rawData: attributeDatatypeEnum.BOOLEAN,
      disabled: false
    },
    {
      displayValue: `${FORM_CONFIG.moduleName}.${FORM_CONFIG.name}.form.dataType.option.reference`,
      value: attributeDatatypeEnum.REFERENCE,
      rawData: attributeDatatypeEnum.REFERENCE,
      disabled: false
    },
  ];

}
