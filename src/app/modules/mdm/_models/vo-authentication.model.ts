import {FormGroup} from '@angular/forms';
import {Utils} from "src/app/shared/utils/utils";

export class VoAuthenticationModel {
  username: string = '';
  voAuthentication: string = '';

  constructor(form: FormGroup | number) {
    if (form instanceof FormGroup) {
      this.username = Utils.getFormControlValue(form, 'userName');
      this.voAuthentication = Utils.getFormControlValue(form, 'voAuthentication');
    }
  }
}
