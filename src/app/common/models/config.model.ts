import {FieldModel} from "./field.model";

export interface Config {
  name?: string
  moduleName?: string,
  filterForm?: FieldModel[],
  tableField?: string,
  isOnlyViewTable?: boolean,
  isHideBreadCrum?: boolean,
  isPopupViewEdit?: boolean,
  isPopupOnlyEdit?: boolean,
  isViewDataWithSmartTable?: boolean,
  sortBy?: string,
  sortDirection?: string
}
