import {HttpClient} from '@angular/common/http';
import {TranslateLoader} from '@ngx-translate/core';
import {catchError, Observable, of} from 'rxjs';
import {ModuleNameEnum} from 'src/app/shared/enums/module.name.enum';
import {environment} from 'src/environments/environment';

const appAvailableLanguages: string[] = environment.LANGS.map(l => l.code);

export class TranslateLoaderFactoryHelper {
  static forModule(module?: string): any {
    return class LazyTranslateLoader implements TranslateLoader {
      constructor(private http: HttpClient) {
      }

      getTranslation(lang: string): Observable<any> {
        if(!appAvailableLanguages.includes(lang)) {
          lang = environment.DEFAULT_LANGUAGE;
        }
        if(!module) {
          module = ModuleNameEnum.COMMON
        }

        // Dev/mock mode: load bundled translations from assets (no backend dependency).
        if (environment.MOCK_API) {
          // Current repo ships a common Vietnamese bundle at src/assets/i18n/vi.json.
          // This is enough to avoid showing raw translation keys while documenting.
          return this.http.get(`assets/i18n/${lang}.json`, {responseType: 'json'}).pipe(
            catchError(() => of({}))
          );
        }
        
        return this.http.get(
          `${environment.BASE_URL}/api/v1/mdm/language/${lang}/${module}`, {responseType: 'json'}).pipe(
          catchError(error => {
            return of({}); // Trả về object rỗng nếu có lỗi
          })
        );
      }
    };
  }
}
