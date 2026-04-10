import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Component, Inject, Input, OnInit, Optional} from '@angular/core';
import {FormBuilder, ValidatorFn, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  AuthoritiesService,
  BaseAddEditComponent,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import {VIETNAMESE_REGEX} from "src/app/shared/constants/regex.constants";

@Component({
  selector: 'app-input-confirm-dialog',
  templateUrl: './input-confirm-dialog.component.html',
  styleUrls: ['./input-confirm-dialog.component.scss'],
  standalone: false,
})
export class InputConfirmDialogComponent extends BaseAddEditComponent implements OnInit {
  title: string = '';
  message: string = '';
  label: string = '';
  required: boolean = true;
  backBtnName: string = '';
  saveBtnName: string = '';
  maxLength: number = 255;
  validators: ValidatorFn[] = [Validators.pattern(VIETNAMESE_REGEX)];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected location: Location,
    protected translateService: TranslateService,
    protected utilsService: UtilsService,
    protected authoritiesService: AuthoritiesService,
    protected fb: FormBuilder,
    protected http: HttpClient,
    @Optional() protected matDialogRef: MatDialogRef<any>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    super(activatedRoute, location, translateService, utilsService, authoritiesService);

    if(data) {
      this.title = data.title;
      this.message = data.message;
      this.label = data.label;
      this.required = data.required || true;
      this.backBtnName = data.backBtnName;
      this.saveBtnName = data.saveBtnName;
      this.maxLength = data.maxLength;
      this.validators = data.validators || this.validators;
    }

    this.addEditForm = this.fb.group({
      name:  ['', this.validators],
    });
  }

  onSubmit() {
    const codeValue = this.addEditForm.get('name')!.value;
    this.matDialogRef.close(codeValue);
  }
}
