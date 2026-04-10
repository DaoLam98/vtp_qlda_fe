import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiService, UtilsService } from '@c10t/nice-component-library';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

export class ReportUtils {
  static startBeforeEndDateValidator(startDateKey: string, endDateKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const startDate = formGroup.get(startDateKey)?.value;
      const endDate = formGroup.get(endDateKey)?.value;

      if (!startDate || !endDate) return null;

      const start = new Date(startDate);
      const end = new Date(endDate);

      const endDateControl = formGroup.get(endDateKey);

      if (start > end) {
        endDateControl?.setErrors({ ...(endDateControl.errors || {}), startDateAfterEndDate: true });
        return { startDateAfterEndDate: true };
      } else {
        if (endDateControl?.hasError('startDateAfterEndDate')) {
          const errors = { ...(endDateControl.errors || {}) };
          delete errors.startDateAfterEndDate;
          if (Object.keys(errors).length === 0) {
            endDateControl.setErrors(null);
          } else {
            endDateControl.setErrors(errors);
          }
        }
      }

      return null;
    };
  }

  static onDownload(params: HttpParams, apiService: ApiService, utilsService: UtilsService) {
    const apiCall = apiService
      .postBlob(`${environment.PATH_API_V1}/project/report/export`, null, {
        params: params,
      })
      .pipe(
        catchError(async (error: HttpErrorResponse) => {
          if (error.error instanceof Blob) {
            const text = await error.error.text();
            const json = JSON.parse(text);
            throw json.message;
          }
          throw error;
        }),
      );
    utilsService.execute(
      apiCall,
      (res: HttpResponse<Blob>) => {
        const url = window.URL.createObjectURL(res.body!);
        const a = document.createElement('a');
        a.href = url;
        const contentDisposition = res.headers?.get('content-disposition')!;
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)!;
        const fileName = `${decodeURIComponent(matches[1].replace(/['"]/g, ''))}`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      '',
      '',
    );
  }
}
