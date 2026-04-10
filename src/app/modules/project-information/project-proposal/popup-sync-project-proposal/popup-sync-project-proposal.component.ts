import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, FileTypeEnum,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../project-proposal-search/project-proposal-search.config';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-popup-sync-project-proposal',
  templateUrl: './popup-sync-project-proposal.component.html',
  styleUrl: './popup-sync-project-proposal.component.scss',
  standalone: false,
})
export class PopupSyncProjectProposalComponent extends BaseAddEditComponent {
  configForm!: Config;
  protected readonly environment = environment;
  protected readonly Utils = Utils;

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
      files: [],
    });
  }

  get FileTypes() {
    return FileTypeEnum;
  }

  onDownloadFile(file: any) {
    const fileName = file.name || '';
    const filePath = file.filePath || '';
    if(!filePath) return;
    this.apiService
      .getBlob(`${environment.PATH_API_V1}/mdm/file?filePath=${filePath}`, new HttpParams())
      .toPromise()
      .then((blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.split('/').pop() || 'downloaded-file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download failed:', error);
      });
  }

  onSubmit() {
    const formData = new FormData();
    const payload = this.data.data
    payload.proposalSyncAction = 'SYNC'
    formData.append(
      'body',
      this.utilsService.toBlobJon({
        ...payload,
      }),
    );
    const lstFile = this.addEditForm.controls.files?.value || [];
    [...lstFile]?.forEach((file: any, index: number) => {
      if (file.binary) {
        formData.append('files', file.binary, file.name);
      }
    });
    const apiCall = this.apiService.put(
      `${environment.PATH_API_V1}/project/project-proposal/${this.data.id}`,
      formData,
    );
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.matDialogRef.close(true);
      },
      `project.project-proposal.sync.success`,
      'common.title.confirm',
      undefined,
      `project.project-proposal.confirm.sync`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }
}
