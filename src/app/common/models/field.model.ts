export enum FieldType {
  DATE = 'date',
  DATE_RANGE = 'dateRange',
  NUMBER = 'number',
  TEXT = 'text',
  COMBOBOX = 'combobox',
}

export interface FieldModel {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: any[];
  isHidden?: boolean;
  isMultiSelect?: boolean; // Sử dụng cho FieldType.COMBOBOX chọn nhiều giá trị
  validate?: any[];
  skipQueryParam?: boolean; // Không thêm vào query param khi tìm kiếm
}
