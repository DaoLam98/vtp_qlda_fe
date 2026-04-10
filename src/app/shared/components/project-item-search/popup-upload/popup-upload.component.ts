import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  BaseAddEditComponent,
  UtilsService,
  AuthoritiesService,
  ApiService,
  FileTypeEnum,
  UploadModel,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../../organization/organization-tree/organization-tree.config';
import { Location } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-popup-upload',
  templateUrl: './popup-upload.component.html',
  styleUrl: './popup-upload.component.scss',
  standalone: false,
})
export class PopupUploadComponent extends BaseAddEditComponent {
  configForm!: Config;
  protected readonly environment = environment;
  protected readonly Utils = Utils;
  readonly FileTypes = FileTypeEnum;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected apiService: ApiService,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.addEditForm = this.fb.group({
      files: [null, [Validators.required]],
    });
  }

  onSubmit() {
    const files = this.addEditForm.value.files as UploadModel[];
    if (files.length === 0) {
      return;
    }
    const formData = new FormData();
    formData.append('file', files[0].binary!, files[0].name);

    let params = new HttpParams()
      .set('expressionDetailName', this.data.expressionDetailName)
      .set('expressionDetailId', this.data.expressionDetailId)
      .set('frequency', this.data.frequency)
      .set('itemType', 'QUANTITATIVE')
      .set('status', 'APPROVED');
    
    if(this.data.expressionInformationTypeId) {
      params = params.set('expressionInformationTypeId', this.data.expressionInformationTypeId);
    }
    
    if( this.data.projectId ) {
      params = params.set('projectId', this.data.projectId);
    }

    const queryParams = [];

    if (this.data.startDate) {
      const startDateStr = this.data.startDate.toString();
      const formattedStartDate = `${startDateStr?.split(' ')[0]} 00:00:00`;
      queryParams.push(`startDate=${encodeURIComponent(formattedStartDate)}`);
    }

    if (this.data.endDate) {
      const endDateStr = this.data.endDate.toString();
      const formattedEndDate = `${endDateStr?.split(' ')[0]} 23:59:59`;
      queryParams.push(`endDate=${encodeURIComponent(formattedEndDate)}`);
    }

    this.apiService
      .postBlob(
        `${environment.PATH_API_V1}/project/${this.data.apiName}/${
          this.data[this.data.parentModelIdentityKey]
        }/import?${queryParams.join('&')}`,
        formData,
        { params },
      )
      .pipe(
        catchError(async (error: HttpErrorResponse) => {
          this.addEditForm.patchValue({ files: [] });
          if (error.error instanceof Blob) {
            const text = await error.error.text();
            try {
              const json = JSON.parse(text);
              this.utilsService.showError(json.message);
            } catch {
              this.utilsService.showError(text);
            }
          }
          throw error;
        }),
      )
      .subscribe((res) => {
        if (res.body?.type === 'application/octet-stream') {
          const contentDisposition = res.headers?.get('content-disposition')!;
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)!;
          const fileName = `${decodeURIComponent(matches[1].replace(/['"]/g, ''))}.xlsx`;
          const url = window.URL.createObjectURL(res.body);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName!;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.utilsService.showError('project.error.import-fail-with-error-file');
          this.addEditForm.patchValue({ files: [] });
        } else {
          this.utilsService.onSuccessFunc('common.status.success');
          this.matDialogRef.close(true);
        }
      });
  }

  onDownload(event: UploadModel) {
    if (event.binary) {
      const blob = new Blob([event.binary], { type: event.type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = event.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }
}
