import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService, AuthoritiesService, BaseAddEditComponent, UtilsService} from '@c10t/nice-component-library';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {ToastrService} from 'ngx-toastr';
import {Location} from '@angular/common';
import {ChangePasswordService} from './change.password.service';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/app/shared/utils/utils';

export class ChangePasswordDialogData {
  isFirstChangePassword?: boolean;
}

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ChangePasswordComponent extends BaseAddEditComponent {
  inputErrorMsg = new Map<string, () => string>()
    .set('required', () => this.translateService.instant('common.required'))
    .set('sameOldPassword', () => this.translateService.instant('common.sameOldPassword'))
    .set('checkConfirmFalse', () => this.translateService.instant('common.checkConfirmFalse'));

  constructor(private formBuilder: FormBuilder,
              private apiService: ApiService,
              protected translateService: TranslateService,
              protected toastr: ToastrService,
              protected authoritiesService: AuthoritiesService,
              protected activatedRoute: ActivatedRoute,
              protected location: Location,
              protected utilsService: UtilsService,
              private router: Router,
              private dialogRef: MatDialogRef<ChangePasswordComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.addEditForm = this.formBuilder.group({
      oldPassword: [''],
      newPassword: ['', Validators.compose([ChangePasswordService.newPasswordValidationConfirm('newConfirmPassword'),
        ChangePasswordService.newPasswordSameOldPasswordConfirm('oldPassword')])],
      newConfirmPassword: ['', ChangePasswordService.newPasswordValidationConfirm('newPassword')]
    });
  }

  onSave() {
    const params = new HttpParams()
      .set('oldPassword', this.addEditForm.get('oldPassword')?.value + '')
      .set('newPassword', this.addEditForm.get('newPassword')?.value + '')
      .set('newConfirmPassword', this.addEditForm.get('newConfirmPassword')?.value + '');
    const api = () => this.apiService.post('/user/change-password', null, {params}, environment.BASE_AUTHORIZATION_URL);
    Utils.customExecuteErrorHandle(this.utilsService, api,
      this.onSuccessFunc, '.edit.success', 'common.confirmSave', this.onErrorFunc, ['common.password.param']);
  }

  onErrorFunc = (err: string) => {
    this.utilsService.showErrorToarst('validation.change.password.fail');
  }

  onSuccessFunc = (data: any, msg?: string) => {
    this.utilsService.onSuccessFunc('validation.change.password.success');
    setTimeout(() => this.router.navigate(['/logout']).then(), 500);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
