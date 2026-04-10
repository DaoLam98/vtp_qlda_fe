import {SelectModel, UtilsService} from '@c10t/nice-component-library';

export class EnumUtil {
  static enum2SelectModel(e: {}, d: SelectModel[], opt: 'SEARCH' | 'EDIT', isTranslate?: boolean, utilsService?: UtilsService): void {
    Object.keys(e).forEach(key => {
      let value;
      if(isTranslate) {
        value = utilsService ? utilsService.getEnumValueTranslated(e, key.replace('_', '')) : '';
      } else {
        value = UtilsService.getEnumValue(e, key.replace('_', ''));
      }
      switch(opt) {
        case 'SEARCH': {
          d.push(new SelectModel(key, value));
          break;
        }
        case 'EDIT': {
          if(key === '_') {
            return;
          }
          d.push(new SelectModel(key.replace('_', ''), value));
          break;
        }
      }
    });
  }

  static getKeysByValues(e: any, values: string[]): string {
    const results: string[] = [];
    Object.keys(e).forEach((k: string) => {
      values.forEach((v: string) => {
        if(e[k] === v) {
          results.push(k.replace('_', ''));
        }
      });
    });
    return results.join(', ');
  }
}
