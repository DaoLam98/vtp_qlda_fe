import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  SelectModel,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../project-proposal-search/project-proposal-search.config';
import { Location } from '@angular/common';

@Component({
  selector: 'app-popup-upgrade-project-proposal',
  templateUrl: './popup-upgrade-project-proposal.component.html',
  styleUrl: './popup-upgrade-project-proposal.component.scss',
  standalone: false,
})
export class PopupUpgradeProjectProposalComponent extends BaseAddEditComponent {
  configForm!: Config;
  protected readonly environment = environment;
  protected readonly Utils = Utils;
  options: SelectModel[] = [
    {
      value: true,
      displayValue: this.translateService.instant('project.project-proposal.upgrade-popup.isOnlyVtpApproved.true'),
      rawData: true,
      disabled: false,
    },
    {
      value: false,
      displayValue: this.translateService.instant('project.project-proposal.upgrade-popup.isOnlyVtpApproved.false'),
      rawData: false,
      disabled: false,
    },
  ];

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
      isOnlyVtpApproved: [true],
      reasonUpgrade: [''],
    });
  }

  onSubmit() {
    const apiCall = this.apiService.post(
      `${environment.PATH_API_V1}/project/project-proposal/${this.data.id}/upgrade`,
      this.addEditForm.value,
    );
    this.utilsService.execute(
      apiCall,
      (data: any, message?: string) => {
        this.utilsService.onSuccessFunc(message);
        this.matDialogRef.close(data);
      },
      `project.project-proposal.upgrade.success`,
      'common.title.confirm',
      undefined,
      `project.project-proposal.confirm.upgrade`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }
}
