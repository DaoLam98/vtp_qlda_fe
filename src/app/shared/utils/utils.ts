import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UtilsService} from '@c10t/nice-component-library';
import {TranslateService} from '@ngx-translate/core';
import {DatePipe, DecimalPipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  static getPosition(e: any, arr: any[] | undefined) {
    return !!arr && arr.length > 0 ? (arr.indexOf(e) + 1).toString() : '';
  }

  static customExecuteErrorHandle(
    utilsService: UtilsService,
    method: () => Observable<any>,
    onSuccessFunc: (this: void, d: any, onSuccessMessage?: string) => void,
    onSuccessMessage: string,
    confirmMsg: string,
    onErrorFunc: (err: any) => void,
    confirmMsgParamsFormat: string[] = [],
  ) {
    utilsService.showConfirmDialog(
      confirmMsg, confirmMsgParamsFormat, '', [], undefined, 'common.OK', 'common.Cancel')
      .afterClosed().subscribe(result => {
      if(result && result.value) {
        method().subscribe((data: any) => {
          onSuccessFunc(data, onSuccessMessage);
        }, error1 => {
          if(error1 !== '401') {
            onErrorFunc(error1);
          }
        });
      }
    });
  }

  static getKeyTrans(moduleName?: string, screenName?: string, key?: string) {
    if(!moduleName || !screenName || !key) {
      return key || '';
    }
    return moduleName + '.' + screenName + '.table.header.' + key;
  }

  static translateKey(translateService: TranslateService, moduleName?: string, screenName?: string, key?: string) {
    if(!moduleName || !screenName || !key) {
      return key || '';
    }
    const translationKey = this.getKeyTrans(moduleName, screenName, key);
    return translateService.instant(translationKey);
  }

  /**
   * @usage Lấy giá trị hiện tại của 1 Observable
   */
  static getObservableValue<T>(obs: Observable<T>): T {
    let value: T;

    obs.subscribe((res) => {
      value = structuredClone(res);
    });

    // @ts-ignore
    return value;
  }

  static formatDate(datePipe: DatePipe, x: string) {
    return datePipe.transform(x, 'dd/MM/yyyy HH:mm', '+0000') || '';
  }

  static formatDateToHour(datePipe: DatePipe, x: string) {
    return datePipe.transform(x, 'HH:mm', '+0000') || '';
  }

  static formatCurrency(x: number) {
    return x.toLocaleString('en-US');
  }

  static formatCurrencyWithComma(x: number) {
    // Định dạng theo vi-VN trước (vd: 1.234.567)
    const formatted = Intl.NumberFormat('vi-VN').format(x);
    // Đổi dấu . -> ,
    return formatted.replace(/\./g, ',');
  }


  static formatDecimalNumber(decimalPipe: DecimalPipe, number: any) {
    return typeof number === 'number' ? decimalPipe.transform(number, '1.0-0') : '';
  }

  static uniqBy<T, K extends keyof T>(arr: T[], key: K) {
    return Array.from(new Map(arr.map(item => [item[key], item])).values());
  }

  /**
   * @usage Chuyển số thành định dạng tiền tệ. Ví dụ : 1234567 thành 1.234.567.00
   */
  static formatNumberWithDots(input: number | string): string {
    if(input === null || input === undefined || input === "") return "";
    const num = Number(input);
    if(isNaN(num)) return "";
    // Nếu số tuyệt đối nhỏ hơn 1, giữ nguyên, không format
    if(Math.abs(num) < 1) {
      return num.toString();
    }
    // Format số >= 1 với dấu phẩy ngăn cách hàng nghìn, giữ 2 số thập phân
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  static msToHours(ms?: number | null): string {
    if(typeof ms !== 'number' || isNaN(ms)) return '';
    return (ms / 3600000).toFixed(2).replace(/\.00$/, '');
  }

  /**
   * Kiểm tra xem route hiện tại (hoặc bất kỳ cấp cha nào)
   * có `routeKey` trùng với key mong muốn hay không.
   *
   * @param route       ActivatedRoute hiện tại (inject từ constructor)
   * @param targetKey   Giá trị routeKey cần so sánh (đặt trong data{} của route config)
   * @returns           true nếu route hiện tại hoặc cha của nó có routeKey khớp
   **/
  static isCurrentRoute(route: ActivatedRoute, targetKey: string): boolean {
    for(const r of route.pathFromRoot) {
      if(r.snapshot.data?.routeKey === targetKey) {
        return true;
      }
    }
    return false;
  }

  /**
   * Lấy giá trị của FormControl trong FormGroup theo key.
   * Nếu không có giá trị thì trả về defaultValue.
   * Nếu giá trị là chuỗi thì loại bỏ khoảng trắng đầu/cuối.
   *
   * @param formGroup    FormGroup chứa FormControl
   * @param key          Tên key của FormControl cần lấy giá trị
   * @param defaultValue Giá trị mặc định nếu không có
   * @returns            Giá trị của FormControl hoặc defaultValue
   */
  static getFormControlValue(formGroup: FormGroup, key: string, defaultValue: any = null): any | null {
    const value = formGroup.get(key)?.value || defaultValue;
    if(typeof value === 'string') {
      return value?.trim();
    }
    return value;
  }

  static markAllAsDirty(form: FormGroup) {
    Object.keys(form.controls).forEach(field => {
      const control = form.get(field);

      if(control instanceof FormGroup) {
        this.markAllAsDirty(control);
      } else {
        control?.markAsDirty({onlySelf: true});
        control?.updateValueAndValidity({onlySelf: true});
      }
    });
  }

  static toPlainString(num: number) {
    const str = num.toString();

    // Không phải dạng scientific notation → trả về luôn
    if (!str.includes('e')) return str;

    const [baseStr, expStr] = str.split(/[eE]/);
    const sign = num < 0 ? '-' : '';
    const exponent = Math.abs(Number(expStr));
    const base = baseStr.replace('.', '');

    return sign + '0.' + '0'.repeat(exponent - 1) + base;
  }
}
