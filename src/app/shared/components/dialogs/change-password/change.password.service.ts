import {AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';

export class ChangePasswordService implements Validators {
  static asyncNewPasswordValidationConfirm(compareControlName: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      const compareControl = (control.parent as FormGroup)?.controls[compareControlName];
      if (compareControl && compareControl.invalid) {
        compareControl.updateValueAndValidity();
      }

      if (!compareControl || !compareControl.value || !control.value) {
        return of(null);
      }

      const isMatch = compareControl.value === control.value;
      return of(isMatch ? null : { checkConfirmFalse: { checkConfirmFalse: true } });
    };
  }

  static newPasswordValidationConfirm(compareControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const compareControl = (control.parent as FormGroup)?.controls[compareControlName];
      if (compareControl && compareControl.invalid) {
        compareControl.updateValueAndValidity();
      }

      if (compareControl && compareControl.value === control.value) {
        return null;
      }

      if (compareControl && compareControl.value && control.value) {
        return { checkConfirmFalse: { checkConfirmFalse: true } };
      }

      return null;
    };
  }

  static newPasswordSameOldPasswordConfirm(compareControlName: string = 'oldPassword'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const compareControl = (control.parent as FormGroup)?.controls[compareControlName];
      if (compareControl && compareControl.invalid) {
        compareControl.updateValueAndValidity();
      }

      return (compareControl && compareControl.value !== control.value)
        ? null
        : { sameOldPassword: { sameOldPassword: true } };
    };
  }
}
