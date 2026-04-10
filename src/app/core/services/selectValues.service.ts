import {HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiService, SelectModel} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {map, Observable, of, startWith} from 'rxjs';
import {environment} from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class SelectValuesService {
  statusValues: SelectModel[] = [
    {
      displayValue: this.translateSv.instant('common.combobox.option.default'),
      value: -1,
      rawData: -1,
      disabled: false
    },
    {
      displayValue: this.translateSv.instant('common.active'),
      value: 'APPROVED',
      rawData: 'APPROVED',
      disabled: false
    },
    {
      displayValue: this.translateSv.instant('common.inactive'),
      value: 'REJECTED',
      rawData: 'REJECTED',
      disabled: false
    }
  ];

  constructor(
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected translateSv: TranslateService
  ) {
  }

  /**
   * @usage : API lấy danh sách giá trị cho combobox
   * @params viewData : Hiển thị lên UI với định dạng : Nguyễn Văn A (546173)
   * @params ignoreEmptyValue : Bỏ đi lựa chọn 'Chọn giá trị' với value = -1
   * @params displayField : Trường trong API được sử dụng để hiển thị giá trị lên UI. Mặc định là name
   * @params getAllOptions : Lấy tất cả các lựa chọn (bao gồm cả giá trị có trạng thái APPROVED và REJECTED)
   */
  getAutocompleteValuesFromModulePath(
    modulePath: string,
    listParam?: { key: string, value: any }[],
    viewData?: { code: string, name: string, value?: string },
    selectedFields?: string,
    ignoreEmptyValue?: boolean,
    displayField?: string,
    getAllOptions?: boolean
  ): Observable<SelectModel[]> {
    const paramSelectedFields = 'id,code,name,status';
    let params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', selectedFields === '' ? '9999' : environment.INTEGER_MAX_VALUE.toString())
      .set('selectedFields', selectedFields ?? paramSelectedFields);

    listParam?.forEach(param => {
      params = params.set(param.key, param.value);
    });

    if (!getAllOptions) {
      params = params.set('status', 'APPROVED');
    }

    const mapItemToSelectModel = (item: any): SelectModel => {
      let displayName = !viewData
        ? item?.[displayField ?? 'name']
        : `${item[viewData.name]} (${item[viewData.code]})`;

      if (item.status === 'REJECTED') {
        displayName += ` (${this.translateService.instant('common.inactive')})`;
      }

      return new SelectModel(
        viewData?.value ? item[viewData.value] : item?.id,
        displayName,
        item.status === 'REJECTED',
        item
      );
    };

    const mapResponse = (res: any): SelectModel[] => {
      const mapped = res.content.map(mapItemToSelectModel);
      if (ignoreEmptyValue) {
        return mapped;
      } else {
        return [
          new SelectModel(
            -1,
            this.translateService.instant('common.combobox.option.default'),
            false,
            {}
          ),
          ...mapped
        ];
      }
    };

    return this.apiService
      .get(modulePath, params)
      .pipe(
        map(mapResponse),
        startWith([])
      );
  }

  getRawDataFromModulePath(modulePath: string, listParam?: { key: string, value: any }[]): Observable<any[]> {
    let params = new HttpParams().set('pageNumber', '1').set('pageSize', environment.INTEGER_MAX_VALUE.toString()).set(
      'status', 'APPROVED');
    // Thêm các tham số từ listParam vào params
    if(listParam && listParam.length > 0) {
      listParam.forEach(param => {
        params = params.set(param.key, param.value);
      });
    }
    return this.apiService
      .get(modulePath, params)
      .pipe(
        map((res: any) => res.content),
        startWith([]),
      );
  }

  getStatus(): Observable<SelectModel[]> {
    return of(this.statusValues)
  }

  getAutocompleteValuesFromVOffice(modulePath: string, listParam: {
    key: string, value: any
  }[], listNameKey: string): Observable<SelectModel[]> {
    let params = new HttpParams();
    if(listParam && listParam.length > 0) {
      listParam.forEach(param => {
        params = params.set(param.key, param.value);
      });
    }

    return this.apiService
      .get(modulePath, params, environment.VOFFICE_URL)
      .pipe(
        map((res: any) => res[listNameKey].map((item: any) => new SelectModel(item?.id, item.title, false, item))),
        startWith([]),
      );
  }
}
