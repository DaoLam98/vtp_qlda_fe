import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent,
  DateUtilService,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, map } from 'rxjs';
import { VoAuthenticationModel } from 'src/app/modules/mdm/_models/vo-authentication.model';
import { GenderEnum } from 'src/app/shared/enums/gender.enum';
import { CryptoService } from 'src/app/shared/services/crypto.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss'],
  standalone: false,
})
export class PersonalInformationComponent extends BaseAddEditComponent implements OnInit {
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected apiService: ApiService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected cryptoService: CryptoService,
    protected dateUtilService: DateUtilService,
    @Optional() protected matDialogRef: MatDialogRef<any>,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);
    this.addEditForm = this.fb.group({
      userName: [],
      code: [],
      fullName: [],
      jobPositionName: [],
      organizationName: [],
      email: [],
      phoneNumber: [],
      gender: [],
      dob: [],
      username: [],
      password: [],
      voAuthentication: [],
    });
  }

  async ngOnInit(): Promise<void> {
    const me  = this.authoritiesService.me?.userAuthentication?.principal
    const params = new HttpParams()
      .set('pageNumber', '1')
      .set('pageSize', '1')
      .set('userName', `${me?.username}`);
    const user = await lastValueFrom(
      this.apiService
        .get(`${environment.PATH_API_V1}/mdm/internal-user`, params)
        .pipe(map((res: any) => res.content[0])),
    );

    let voAuthentication = {
      username: '',
      password: '',
    };
    try {
      const decryptedData = await this.cryptoService.decrypt(user.voAuthentication);
      voAuthentication = JSON.parse(decryptedData);
    } catch (error) {      
    }

    this.addEditForm.patchValue({
      ...user,
      dob: this.dateUtilService.convertDateToDisplayServerTime(user.dob),
      gender: user.gender ? this.utilsService.getEnumValueTranslated(GenderEnum, user.gender) : '',
      username: this.authoritiesService.me?.userAuthentication?.principal?.username,
      password: voAuthentication.password,
      phoneNumber: me?.phone,
    });
  }

  async onSubmit() {
    const voAuthentication = await this.cryptoService.encrypt(
      JSON.stringify({
        username: this.addEditForm.get('username')?.value,
        password: this.addEditForm.get('password')?.value,
      }),
    );
    this.addEditForm.patchValue({ voAuthentication: voAuthentication });
    const model = new VoAuthenticationModel(this.addEditForm);

    const apiCall = this.apiService.put(`${environment.PATH_API_V1}/mdm/user/update-vo-authentication`, model);

    this.utilsService.execute(apiCall, this.onSuccessFunc, `common.edit.success`, `common.confirm.edit`, []);
  }

  onSuccessFunc = (data: any, onSuccessMessage: string | undefined) => {
    this.utilsService.onSuccessFunc(onSuccessMessage ? onSuccessMessage : 'common.default.success');
    this.matDialogRef.close();
  };
}
