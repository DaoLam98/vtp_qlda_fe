import { Location } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  UtilsService
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { FORM_CONFIG } from '../cycle-management-search/cycle-management-search.config';

@Component({
  selector: 'app-popup-add-cycle-management',
  templateUrl: './popup-add-cycle-management.component.html',
  standalone: false,
})
export class PopupAddCycleManagementComponent extends BaseAddEditComponent {
  configForm!: Config;
  protected readonly environment = environment;
  protected readonly Utils = Utils;
  errorMessages: Map<string, () => string> = new Map([
    ['max', () => 'mdm.cycle-management.error.max-year'],
    ['min', () => 'mdm.cycle-management.error.min-year'],
  ]);

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected router: Router,
    protected apiService: ApiService,
    protected selectValuesService: SelectValuesService,
    protected permissionCheckingUtil: PermissionCheckingUtil,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) protected data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.configForm = JSON.parse(JSON.stringify(FORM_CONFIG));
    this.addEditForm = this.fb.group({
      year: [null, [Validators.min(1900), Validators.max(3000)]],
      format: ['MM-yyyy'],
    });

    this.addEditForm.get('year')?.valueChanges.subscribe((year) => {
      if (year < 0) {
        setTimeout(() => {
          this.addEditForm.get('year')?.patchValue("0", { emitEvent: false });
        });
      }
    });
  }

  onSubmit() {
    const getMonthStartEnd = (year: number, month: number) => {
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)).toISOString().replace('T', ' ');
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 0, 0)).toISOString().replace('T', ' ');
      return { startDate, endDate };
    };
    let payload = [];
    for (let i = 1; i <= 12; i++) {
      const month = i < 10 ? `0${i}` : i;
      const periodCode = `${month}-${this.addEditForm.value.year}`;
      const { startDate, endDate } = getMonthStartEnd(this.addEditForm.value.year, i);
      const body = {
        periodCode: periodCode,
        startDate: startDate,
        endDate: endDate,
        cycleStatus: 'CLOSE',
        year: this.addEditForm.value.year,
      };
      payload.push(body);
    }

    const formData = new FormData();
    formData.append('body', this.utilsService.toBlobJon(payload));

    const apiCall = this.apiService.post(`${environment.PATH_API_V1}/mdm/cycle-management`, formData);

    this.utilsService.execute(
      apiCall,
      (data, message) => {
        this.utilsService.onSuccessFunc(message);
        this.matDialogRef.close(data);
      },
      `common.add.success`,
      'common.title.confirm',
      undefined,
      `common.confirm.add`,
      undefined,
      undefined,
      'common.button.confirm',
      'common.button.back',
    );
  }
}
