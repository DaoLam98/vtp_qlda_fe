import { FormlyFieldConfig } from '@ngx-formly/core';
import { v4 as uuidv4 } from 'uuid';
import { debounceTime } from 'rxjs';
import { VIETNAMESE_REGEX } from 'src/app/shared/constants/regex.constants';


const ExpressOption = [
  { value: '+', label: 'Cộng' },
  { value: '-', label: 'Trừ' },
  { value: '*', label: 'Nhân' },
  { value: '/', label: 'Chia' },
];

const FuncOption = [
  { value: 'if', label: 'IF' },
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
];

// Bieu thuc tinh toan
export interface RulesetCal {
  typeExpression: 'expression' | 'function' | '';
  condition: '+' | '-' | '*' | '/' | 'if' | 'or' | 'and' | '';
  rules: Array<RulesetCal | Rule>;
  funcType?: string;
  itemId: string,
  isRuleset: boolean;
}

export interface Rule {
  field: string;
  value?: any;
  operator: string;
  funcType: string;
  [key: string]: string;
}

// Ham If
export interface RulesetIf {
  typeExpression: '';
  condition: '';
  rules: Array<RulesetIf | RuleIf>;
}

export interface RuleIf {
  itemId: string;
  typeFunc: string;
  func: string;
  ifField: string;
  ifValue?: any;
  compareOperator: string;
  compare: string;
  compareValue:string;
  thenField: string;
  thenValue: string;
  elseField: string;
  elseValue: string;
  rules: Array<RulesetIf | RuleIf>;
}

// Ham And Or
export interface RulesetAndOr {
  typeExpression: string;
  condition: string;
  itemId: string;
  rules: Array<RulesetAndOr | RuleAndOr>;
}

export interface RuleAndOr {
  itemId: string;
  typeFunc: string;
  func: string;
  typeExpression: string;
  condition?: any;
  compareOperator: string;
  compare: string;
  compareValue:string;
  rules: Array<RulesetAndOr | RuleAndOr>;
}

export interface RuleOptions {
  fields: Array<{
    value: string;
    label: string;
    valueField: Partial<FormlyFieldConfig>;
  }>;
}

// Bieu thuc
export function createRuleset(type?: string): RulesetCal {
  return {
    itemId: uuidv4(),
    isRuleset: true,
    typeExpression: '',
    condition: '',
    rules: [],
    funcType: type
  };
}

export function createRule(type: string = ''): Rule {
  return {
    itemId: uuidv4(),
    operator: 'cal',
    field: '',
    value: '',
    funcType: type
  };
}

// If
export function createRuleIf(func: string = ''): RuleIf {
  return {
    itemId: uuidv4(),
    rules: [],
    typeFunc: 'if',
    ifField: '',
    ifValue: '',
    compare: '',
    compareValue: '',
    thenField: '',
    thenValue: '',
    elseField: '',
    elseValue: '',
    compareOperator: '',
    func: func || ''
  };
}

// and or
export function createRuleAndOr(func: string = ''): RuleAndOr {
  return {
    itemId: uuidv4(),
    rules: [],
    typeFunc: 'and',
    typeExpression: '',
    condition: '',
    compare: '',
    compareValue: '',
    compareOperator: '',
    func: func || ''
  };
}

export function createFormlyRulesetCalculate(funcType?: any, name?: any, isView = false, translate?: any ): FormlyFieldConfig[] {
  return [
    {
      type: 'ruleset',
      className: name,
      fieldGroup: [
        {
          key: 'typeExpression',
          type: 'select',
          defaultValue: '+',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [
              { value: 'expression', label: 'Biểu thức' },
              { value: 'function', label: 'Hàm' },
            ],
            disabled: isView
          },
        },
        {
          key: 'condition',
          type: 'select',
          defaultValue: '+',
          templateOptions: {
            required: true,
            placeholder: translate?.selectCalculation,
            options: [],
            disabled: isView
          },
          expressionProperties: {
            'templateOptions.options': (model: any) => {
              if (model?.typeExpression === 'expression') {
                return ExpressOption
              }
              if (model?.typeExpression === 'function') {
                return FuncOption
              }
              return [];
            },
          },
        },
        {
          key: 'rules',
          name: funcType ?? '',
          type: 'ruleset-rules',
          fieldArray: {
            fieldGroup: [],
          },
        },
      ],
    },
  ];
}

export function createFormlyRuleCalculate(ruleOptions: RuleOptions, translate?: any): FormlyFieldConfig[] {
  const fieldOptions = ruleOptions.fields.map(({ value, label, valueField }) => ({ value, label, valueField }));
  // lọc field trùng
  const uniqueFields = Array.from(
    new Map(ruleOptions.fields.map(item => [item.value, item])).values()
  );
  const valueFieldGroups = uniqueFields.map(item => createField(item, translate, false));
  return [
    {
      type: 'rule',
      fieldGroup: [
        {
          key: 'field',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectValue,
            options: fieldOptions,
            disabled: valueFieldGroups[0]?.templateOptions?.disabled,
          },
          hooks: {
            onInit: (field) => {
              const control = field.formControl;
              if (!control) return;
              const fieldValue = field.model?.field;
              if (fieldValue) {
                const filteredOptions = fieldOptions
                  .filter(
                    (opt: any) =>
                      opt.valueField?.description === 'APPROVED' ||
                      opt.value.toString() === fieldValue.toString()
                  )
                  .map((opt: any) => ({
                    value: opt.value,
                    label: opt.label,
                    disabled: opt.valueField?.description !== 'APPROVED',
                  }));
                if(field.templateOptions) field.templateOptions.options = filteredOptions;
              } else {
                const filteredOptions = fieldOptions
                  .filter((opt: any) => opt.valueField?.description === 'APPROVED')
                if(field.templateOptions) field.templateOptions.options = filteredOptions;
              }
              control?.valueChanges.subscribe(() => {
                  field.model.value = ''
              });
            },
          },
        },
        {
          fieldGroup: valueFieldGroups,
        },
      ],
    },
  ];
}
export function createField(item: any, translate: any, isCompare = false): FormlyFieldConfig {
  const hidden = getHideExpression(item, isCompare);

  switch (item?.fieldGroupClassName) {
    case 'NUMBER':
      return createNumberField(item, translate, hidden);
    case 'STRING':
      return createStringField(item, translate, hidden);
    default:
      return createOtherField(item, hidden);
  }
}

function getHideExpression(item: any, isCompare: boolean): string {
  return !isCompare
    ? `model.field?.toString() !== '${item.value}'`
    : `model.compare?.toString() !== '${item.value}'`;
}

function createNumberField(item: any, translate: any, hidden: string): FormlyFieldConfig {
  return {
    key: `value_${item.value}`,
    hideExpression: hidden,
    type: 'input',
    templateOptions: {
      type: 'text',
      disabled: item.templateOptions?.disabled ?? false,
      required: true,
      placeholder: translate?.inputValue,
      label: item.displayValue,
    },
    hooks: {
      onInit: (field: any) => initNumberField(field, item),
    },
  };
}
function formatNumber(val: string | number) {
  if (val === '' || val == null || val === '-' || val === '-.') return val;
  const [integerPart, decimalPart] = String(val).split('.');
  const isNegative = integerPart.startsWith('-');
  const intPartAbs = integerPart.replace(/-/g, '');
  const formattedInt = Number(intPartAbs || '0').toLocaleString('en-US');
  const withSign = isNegative ? `-${formattedInt}` : formattedInt;
  return decimalPart != null ? `${withSign}.${decimalPart}` : withSign;
}

function initNumberValue(field: any, control: any) {
  const val = control.value;
  if (val != null && val !== '') {
    const numStr = String(val).replace(/,/g, '');
    const formatted = formatNumber(numStr);
    control.setValue(formatted, { emitEvent: false });
    if (field.model) {
      field.model[field.key] = parseFloat(numStr);
      field.model.value = parseFloat(numStr);
      field.model.valueType = 'NUMBER';
    }
  }
}

function handleNumberChange(field: any, control: any, maxLength?: number) {
  control.valueChanges.pipe(debounceTime(80)).subscribe((v: any) => {
    if (v == null) return;

    let clean = String(v).replace(/[^0-9.,-]/g, '').replace(/,/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
    clean = clean.replace(/(?!^)-/g, '');
    if (maxLength && clean.length > maxLength) clean = clean.slice(0, maxLength);

    if (clean === '-' || clean === '-.') {
      control.setValue(clean, { emitEvent: false });
      if (field.model) {
        field.model[field.key] = null;
        field.model.value = null;
        field.model.valueType = 'NUMBER';
      }
      return;
    }

    const numeric = parseFloat(clean);
    const formatted = formatNumber(clean);

    if (formatted !== v) control.setValue(formatted, { emitEvent: false });

    if (field.model) {
      if (!isNaN(numeric)) {
        field.model[field.key] = numeric;
        field.model.value = numeric;
      } else {
        field.model[field.key] = '';
        field.model.value = '';
      }
      field.model.valueType = 'NUMBER';
    }
  });
}

export function initNumberField(field: any, item: any) {
  const control = field.formControl;
  if (!control) return;
  const maxLength = item.templateOptions?.maxLength;

  initNumberValue(field, control);
  handleNumberChange(field, control, maxLength);
}

function createStringField(item: any, translate: any, hidden: string): FormlyFieldConfig {
  return {
    key: `value_${item.value}`,
    hideExpression: hidden,
    type: 'input',
    templateOptions: {
      type: 'text',
      disabled: item.templateOptions?.disabled ?? false,
      required: true,
      maxLength: item.templateOptions?.maxLength,
      placeholder: translate?.inputValue,
      label: item.displayValue,
    },
    hooks: {
      onInit: (field: any) => initStringField(field),
    },
  };
}

function initStringField(field: any) {
  const control = field.formControl;
  if (!control) return;
  const regex = VIETNAMESE_REGEX;

  control.valueChanges.subscribe((v: string) => {
    if (v == null) return;
    let clean = regex.test(v) ? v : v.replace(/[^A-Z0-9ỲỌÁẦẢẤỜỄÀẠẰỆẾÝỘẬỐŨỨĨÕÚỮỊỖÌỀỂẨỚẶÒÙỒỢÃỤỦÍỸẮẪỰỈỎỪỶỞÓÉỬỴẲẸÈẼỔẴẺỠƠÔƯĂÊÂĐa-zỳọáầảấờễàạằệếýộậốũứĩõúữịỗìềểẩớặòùồợãụủíỹắẫựỉỏừỷởóéửỵẳẹèẽổẵẻỡơôưăêâđ()._\-\s]/g, '');
    if (field.model) field.model[field.key] = field.model.value = clean;
    field.model.valueType = 'STRING';
    if (!regex.test(v)) control.setValue(clean, { emitEvent: false });
  });
}

function createOtherField(item: any, hidden: string): FormlyFieldConfig {
  return {
    key: 'value',
    hideExpression: hidden,
    hooks: {
      onInit: (field: any) => {
        const control = field.formControl;
        if (!control) return;
        field.templateOptions = { ...field.templateOptions, options: [...(field.templateOptions?.options || [])] };
        const fieldValue = field.model?.value;
        if (fieldValue) {
          field.templateOptions.options = (field.templateOptions.options || [])
            .filter((opt: any) => opt.status === 'APPROVED' || opt.value?.toString() === fieldValue?.toString())
            .map((opt: any) => ({ ...opt, disabled: opt.status !== 'APPROVED' }));
        } else {
          field.templateOptions.options = (field.templateOptions.options || []).filter((opt: any) => opt.status === 'APPROVED');
        }
      },
    },
    ...item.valueField,
  };
}



export function createFormlyRuleIf(ruleOptions: RuleOptions, translate?: any): FormlyFieldConfig[] {
  const fieldOptions = ruleOptions.fields.map(({ value, label, valueField }) => ({ value, label, valueField }));
  const uniqueFields = Array.from(
    new Map(ruleOptions.fields.map(item => [item.value, item])).values()
  );
  const valueFieldGroups = uniqueFields.map(item => createField(item, translate, true));
  return [
    {
      type: 'rule-if',
      fieldGroup: [
        {
          key: 'ifField',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [
              { value: 'expression', label: translate?.expression },
              { value: 'function', label: translate?.function },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'ifValue',
          type: 'select',
          defaultValue: '+',
          templateOptions: {
            required: true,
            placeholder: translate?.selectCalculation,
            options: [],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          expressionProperties: {
            'templateOptions.options': (model: any) => {
              if (model?.ifField === 'expression') {
                return ExpressOption
              }
              if (model?.ifField === 'function') {
                return FuncOption
              }
              return [];
            },
          },
        },
        {
          key: 'compareOperator',
          type: 'select',
          defaultValue: '',
          templateOptions: {
            required: true,
            placeholder: translate?.compare,
            options: [
              { value: '==', label: '=' },
              { value: '!=', label: '!=' },
              { value: '>', label: '>' },
              { value: '>=', label: '>=' },
              { value: '<', label: '<' },
              { value: '<=', label: '<=' },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'compare',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectValue,
            options: fieldOptions,
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          hooks: {
            onInit: (field: any) => {
              const control = field.formControl;
              let initialized = false;

              const fieldValue = field.model?.compare;

              if (fieldValue) {
                field.templateOptions.options = field.templateOptions.options
                  .filter(
                    (opt: any) =>
                      opt.valueField?.description === 'APPROVED' ||
                      opt.value?.toString() === fieldValue?.toString()
                  )
                  .map((opt: any) => ({
                    value: opt.value,
                    label: opt.label,
                    status: opt.status,
                    disabled: opt.valueField?.description !== 'APPROVED'
                  }));
              } else {
                field.templateOptions.options = (field.templateOptions.options || [])
                  .filter((opt: any) => opt.valueField?.description === 'APPROVED');
              }
              control?.valueChanges.subscribe(() => {
                if (!initialized) {
                  initialized = true;
                  return;
                }
                field.model.value = '';
                field.model.valueType = '';
              });
            },
          },
        },
        {
          fieldGroup: valueFieldGroups,
        },
        {
          key: 'thenField',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [
              { value: 'expression', label: translate?.expression },
              { value: 'function', label: translate?.function },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'thenValue',
          type: 'select',
          defaultValue: '+',
          templateOptions: {
            required: true,
            placeholder: translate?.selectCalculation,
            options: [],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          expressionProperties: {
            'templateOptions.options': (model: any) => {
              if (model?.thenField === 'expression') {
                return ExpressOption
              }
              if (model?.thenField === 'function') {
                return FuncOption
              }
              return [];
            },
          },
        },
        {
          key: 'elseField',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [
              { value: 'expression', label: translate?.expression },
              { value: 'function', label: translate?.function },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'elseValue',
          type: 'select',
          defaultValue: '+',
          templateOptions: {
            required: true,
            placeholder: translate?.selectCalculation,
            options: [],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          expressionProperties: {
            'templateOptions.options': (model: any) => {
              if (model?.elseField === 'expression') {
                return ExpressOption
              }
              if (model?.elseField === 'function') {
                return FuncOption
              }
              return [];
            },
          },
        },
        {
          key: 'rules',
          type: 'ruleset-rules',
          fieldArray: {
            fieldGroup: [],
          },
        },
      ],
    },
  ];
}

export function createFormlyRuleAndOr(ruleOptions: RuleOptions, translate?: any): FormlyFieldConfig[] {
  const fieldOptions = ruleOptions.fields.map(({ value, label, valueField }) => ({ value, label, valueField }));
  const uniqueFields = Array.from(
    new Map(ruleOptions.fields.map(item => [item.value, item])).values()
  );
  const valueFieldGroups = uniqueFields.map(item => createField(item, translate, true));
  return [
    {
      type: 'rule-and-or',
      fieldGroup: [
        {
          key: 'typeExpression',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [
              { value: 'expression', label: translate?.expression },
              { value: 'function', label: translate?.function },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'condition',
          type: 'select',
          defaultValue: '',
          templateOptions: {
            required: true,
            placeholder: translate?.selectFormula,
            options: [],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          expressionProperties: {
            'templateOptions.options': (model: any) => {
              if (model?.typeExpression === 'expression') {
                return ExpressOption
              }
              if (model?.typeExpression === 'function') {
                return FuncOption
              }
              return [];
            },
          },
        },
        {
          key: 'compareOperator',
          type: 'select',
          defaultValue: '=',
          templateOptions: {
            required: true,
            placeholder: translate?.compare,
            options: [
              { value: '==', label: '=' },
              { value: '!=', label: '!=' },
              { value: '>', label: '>' },
              { value: '>=', label: '>=' },
              { value: '<', label: '<' },
              { value: '<=', label: '<=' },
            ],
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
        },
        {
          key: 'compare',
          type: 'select',
          templateOptions: {
            required: true,
            placeholder: translate?.selectValue,
            options: fieldOptions,
            disabled: valueFieldGroups[0]?.templateOptions?.disabled
          },
          hooks: {
            onInit: (field: any) => {
              const control = field.formControl;
              let initialized = false;

              const fieldValue = field.model?.compare;

              if (fieldValue) {
                field.templateOptions.options = field.templateOptions.options
                  .filter(
                    (opt: any) =>
                      opt.valueField?.description === 'APPROVED' ||
                      opt.value?.toString() === fieldValue?.toString()
                  )
                  .map((opt: any) => ({
                    value: opt.value,
                    label: opt.label,
                    status: opt.status,
                    disabled: opt.valueField?.description !== 'APPROVED'
                  }));
              } else {
                field.templateOptions.options = (field.templateOptions.options || [])
                  .filter((opt: any) => opt.valueField?.description === 'APPROVED');
              }
              control?.valueChanges.subscribe(() => {
                if (!initialized) {
                  initialized = true;
                  return;
                }
                field.model.value = '';
                field.model.valueType = '';
              });
            },
          },
        },
        {
          fieldGroup: valueFieldGroups.map(field => ({
            ...field,
            templateOptions: {
              ...field.templateOptions,
              required: true,
            },
          })),
        },
        {
          key: 'rules',
          type: 'ruleset-rules',
          fieldArray: {
            fieldGroup: [],
          },
        },
      ],
    },
  ];
}
export function convertData(
  node: any,
  fieldLabels: Record<string, string> = {},
  option: any[] = []
): string {
  if (!node) return '';

  if (isIfNode(node)) return convertIfNode(node, option, fieldLabels);
  if (isAndOrNode(node)) return convertAndOrNode(node, option, fieldLabels);
  if (isExpressionNode(node)) return convertExpressionNode(node, option, fieldLabels);
  if (isRulesetNode(node)) return convertRulesetNode(node, option, fieldLabels);
  return convertLeafNode(node, option, fieldLabels);
}

// ------------------- Helpers -------------------

export function findOptionForField(fieldName: any, option: any[]) {
  return option?.find((opt: any) => String(opt.value) === String(fieldName));
}

export function mapValueLabel(
  fieldName: any,
  value: any,
  option: any[],
  fieldLabels: Record<string, string>
) {
  if (value === undefined || value === null || value === '') return String(value ?? '');
  const opt = findOptionForField(fieldName, option);
  if (opt?.valueField?.templateOptions?.options) {
    const found = opt.valueField.templateOptions.options.find(
      (o: any) => String(o.value) === String(value)
    );
    if (found) return found.label ?? String(found.value);
  }
  if (fieldName !== undefined && fieldLabels && fieldLabels[fieldName]) {
    return fieldLabels[fieldName];
  }
  return String(value);
}

// ------------------- Node Type Check -------------------

export function isIfNode(n: any) {
  return (
    (String(n?.typeExpression ?? n?.func ?? n?.funcType ?? '').toLowerCase() === 'function' &&
      String(n?.condition ?? '').toLowerCase() === 'if') ||
    String(n?.func ?? n?.funcType ?? '').toLowerCase() === 'if' ||
    String(n?.typeFunc ?? '').toLowerCase() === 'if'
  );
}

export function isAndOrNode(n: any) {
  const check = String(n?.condition ?? n?.func ?? n?.funcType ?? n?.typeFunc ?? '').toLowerCase();
  return check === 'and' || check === 'or';
}

export function isExpressionNode(n: any) {
  return String(n?.typeExpression ?? '').toLowerCase() === 'expression' && Array.isArray(n.rules);
}

export function isRulesetNode(n: any) {
  return n?.isRuleset && Array.isArray(n.rules);
}

// ------------------- Leaf Node -------------------

export function convertLeafNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  if (!node) return '';


  // Trả compareValue nếu có
  const compareVal = getLeafValue(node, `value_${node.compare}`, node.compare, option, fieldLabels);
  if (compareVal) return compareVal;

  // Trả value nếu có
  if (node.value !== undefined && node.value !== null && String(node.value) !== '') {
    return node.field !== undefined
      ? mapValueLabel(node.field, node.value, option, fieldLabels)
      : String(node.value);
  }

  // Trả value_{field} nếu có
  const fieldVal = getLeafValue(node, `value_${node.field}`, node.field, option, fieldLabels);
  if (fieldVal) return fieldVal;

  // Trả compareValue cuối cùng
  if (node.compareValue !== undefined && node.compareValue !== null && String(node.compareValue) !== '') {
    return mapValueLabel(node.compare, node.compareValue, option, fieldLabels);
  }

  return '';
}

// ------------------- Leaf Helpers -------------------

function getLeafValue(
  node: any,
  valueKey: string,
  fieldName: any,
  option: any[],
  fieldLabels: Record<string,string>
) {
  if (node[valueKey] !== undefined && node[valueKey] !== null && String(node[valueKey]) !== '') {
    const referData = option.find((otp: any) => otp.value === fieldName && isNaN(fieldName));
    if (referData) {
      const opt = referData?.valueField?.templateOptions?.options?.find(
        (data: any) => data.value == node[valueKey]
      );
      if (opt) return opt.label ?? String(opt.value);
    }
    return String(node[valueKey]);
  }
  return '';
}
// ------------------- IF Node -------------------

export function convertIfNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  const ifRoot = getIfWrapper(node);

  if (!ifRoot || !Array.isArray(ifRoot.rules)) {
    return convertLeafNode(ifRoot, option, fieldLabels);
  }

  const thenChildren = getThenNodes(ifRoot);
  const elseChildren = getElseNodes(ifRoot);
  const conditionNodes = getConditionNodes(ifRoot);

  const condParts = conditionNodes.map((r:any) => renderConditionNode(r, option, fieldLabels))
    .filter(Boolean);

  const finalCond = renderConditionExpr(ifRoot, condParts, option, fieldLabels);

  const thenRendered = renderThenElse(thenChildren, ifRoot?.thenValue, fieldLabels, option);
  const elseRendered = renderThenElse(elseChildren, ifRoot?.elseValue, fieldLabels, option);

  if (!thenRendered && !elseRendered) return finalCond || '';

  return `IF (${finalCond}) THEN (${thenRendered}) ELSE (${elseRendered})`;
}

// ------------------- If Helpers -------------------

function getIfWrapper(node: any) {
  if (Array.isArray(node.rules) &&
    node.rules.length === 1 &&
    String(node.rules[0].func ?? node.rules[0].funcType ?? '').toLowerCase() === 'if') {
    return node.rules[0];
  }
  return node;
}

function getThenNodes(node: any) {
  return (node.rules || []).filter((r: any) => String(r.funcType || r.func || r.typeFunc || '').toLowerCase() === 'then');
}

function getElseNodes(node: any) {
  return (node.rules || []).filter((r: any) => String(r.funcType || r.func || r.typeFunc || '').toLowerCase() === 'else');
}

function getConditionNodes(node: any) {
  return (node.rules || []).filter((r: any) => !['then','else'].includes(String(r.funcType || r.func || r.typeFunc || '').toLowerCase()));
}

function renderConditionNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  const referData = option.find((otp: any)=> otp.value === node.field && isNaN(node.field));
  const mapValueIf = `value_${node.field}`;
  if (referData) {
    return referData?.valueField?.templateOptions?.options?.find((data: any)=> data.value == node.value)?.label;
  } else if (node[mapValueIf]) {
    return node[mapValueIf];
  } else return String(convertData(node, fieldLabels, option)).trim();
}

function renderConditionExpr(ifRoot: any, condParts: string[], option: any[], fieldLabels: Record<string,string>) {
  const logicalOpRaw = (ifRoot.ifValue ?? '').toString().trim().toUpperCase();
  const logicalOp = (logicalOpRaw === 'AND' || logicalOpRaw === 'OR') ? logicalOpRaw : '';
  const conditionNode = ifRoot?.condition || ifRoot?.ifValue;

  let conditionExpr: string;
  if (condParts.length === 0) conditionExpr = '';
  else if (condParts.length === 1) conditionExpr = condParts[0];
  else {
    conditionExpr = logicalOp
      ? logicalOp + '(' + condParts.join(` ${logicalOp} `) + ')'
      : condParts.join(` ${conditionNode?.toString().trim().toUpperCase()} `);
  }

  if (ifRoot.compare !== undefined && ifRoot.compare !== null && String(ifRoot.compare) !== '') {
    const mapValueIfCompare = `value_${ifRoot.compare}`;
    const cmpVal = ifRoot[mapValueIfCompare]
      ? mapValueLabel(ifRoot.compare, ifRoot[mapValueIfCompare], option, fieldLabels)
      : mapValueLabel(ifRoot.compare, ifRoot.value, option, fieldLabels);
    const cmpOp = ifRoot.compareOperator ?? '=';
    return `(${conditionExpr}) ${cmpOp} ${cmpVal}`;
  }

  return conditionExpr || '';
}

function renderThenElse(nodes: any[], joiner: string, fieldLabels: Record<string,string>, option: any[]) {
  return nodes.map(r => convertData(r, fieldLabels, option))
    .filter(Boolean)
    .join(` ${joiner?.toString().trim().toUpperCase()} `);
}

// ------------------- AND/OR Node -------------------


export function convertAndOrNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  const condName = String(node.condition ?? node.func ?? node.funcType ?? node.typeFunc ?? '').toUpperCase();
  const parts = (node.rules || []).map((r: any) => renderChildExpression(r, fieldLabels, option))
    .filter(Boolean);

  const compareExpr = renderCompareForNode(node, parts, condName, option, fieldLabels);

  if (compareExpr) return compareExpr;

  return joinPartsWithCond(parts, condName);
}

// ------------------- AND/OR Helpers -------------------

function renderChildExpression(r: any, fieldLabels: Record<string,string>, option: any[]) {
  if (String(r.typeExpression ?? '').toLowerCase() === 'expression') {
    const children = (r.rules || []).map((sub:any)=>convertData(sub, fieldLabels, option)).filter(Boolean);
    const joiner = r.condition ? ` ${r.condition} ` : ' ';
    let expr = children.join(joiner);

    if (r.value !== undefined && r.value !== null && r.value !== '') {
      expr = `(${expr}) ${r.compareOperator} ${mapValueLabel(r.compare, r.value, option, fieldLabels)}`;
    }
    return expr;
  } else {
    return convertData(r, fieldLabels, option);
  }
}

function renderCompareForNode(node: any, parts: string[], condName: string, option: any[], fieldLabels: Record<string,string>) {
  const mapValueCompare = `value_${node.compare}`;
  if (node.compare !== undefined && node.compare !== null && String(node.compare) !== '' && node[mapValueCompare] !== undefined) {
    const inner = '(' + parts.join(' ' + condName + ' ') + ')';
    const cmpOp = node.compareOperator ?? '==';
    return `${condName}(${inner}) ${cmpOp} ${mapValueLabel(node.compare, node[mapValueCompare], option, fieldLabels)}`;
  }
  return '';
}

function joinPartsWithCond(parts: string[], condName: string) {
  return condName + '(' + parts.join(' ' + condName + ' ') + ')';
}

// ------------------- Expression Node -------------------

export function convertExpressionNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  const children = (node.rules || []).map((r:any)=>convertData(r, fieldLabels, option)).filter(Boolean);
  const joiner = node.condition ? ` ${node.condition} ` : ' ';
  const expr = children.join(joiner);
  const mapValueExp = `value_${node.compare}`;
  if (node.compareOperator && node[mapValueExp] !== undefined && node[mapValueExp] !== null && node[mapValueExp] !== '') {
    return `(${expr}) ${node.compareOperator} ${mapValueLabel(node.compare, node[mapValueExp], option, fieldLabels)}`;
  } else if (node.compareOperator && node.value !== undefined && node.value !== null && node.value !== '') {
    return `(${expr}) ${node.compareOperator} ${mapValueLabel(node.compare, node.value, option, fieldLabels)}`;
  }
  if (children.length === 1) return children[0];
  return `(${expr})`;
}

// ------------------- Ruleset Node -------------------

export function convertRulesetNode(node: any, option: any[], fieldLabels: Record<string,string>) {
  return (node.rules || []).map((r:any)=>convertData(r, fieldLabels, option)).filter(Boolean).join(' ');
}

