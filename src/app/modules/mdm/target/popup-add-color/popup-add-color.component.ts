import { Location } from '@angular/common';
import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApiService,
  AuthoritiesService,
  BaseAddEditComponent, NumericInputFormat,
  UtilsService,
} from '@c10t/nice-component-library';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/common/models/config.model';
import { SelectValuesService } from 'src/app/core/services/selectValues.service';
import { PermissionCheckingUtil } from 'src/app/shared/utils/permission-checking.util';
import { Utils } from 'src/app/shared/utils/utils';
import { environment } from 'src/environments/environment';
import { ModuleNameEnum } from 'src/app/shared/enums/module.name.enum';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-popup-add-color',
  templateUrl: './popup-add-color.component.html',
  standalone: false,
})
export class PopupAddColorComponent extends BaseAddEditComponent implements OnInit{
  configForm: Config =  {
    moduleName: ModuleNameEnum.MDM,
    name: 'target',
    filterForm: []
  }
  public formatFun: NumericInputFormat = new NumericInputFormat();
  errorMessages: Map<string, () => string> = new Map([
    ['fromGreaterThanTo', () => 'Giá trị "Từ" phải nhỏ hơn "Đến"'],
  ]);
  @Input() title = '';
  btnSave = 'common.btnAdd'
  protected readonly environment = environment;
  protected readonly Utils = Utils;

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
      this.addEditForm = this.fb.group(
        {
          id: [null],
          fromValue: [null],
          toValue: [null],
          color: ['#ee0036'],
          warningId: uuidv4()
        },
        {
          validators: [this.fromLessThanToValidator()],
          updateOn: 'change'
        }
      );
  }

  ngOnInit() {
    if (this.data.warning) {
      this.addEditForm.patchValue(this.data.warning?.object);
      this.btnSave = 'btnUpdate';
    }
  }

  fromLessThanToValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup)) return null;

      const fromControl = group.get('fromValue');
      const toControl = group.get('toValue');
      if (!fromControl || !toControl) return null;


      const from = fromControl.value;
      const to = toControl.value;

      // Nếu chưa nhập đủ, xóa lỗi và bỏ qua
      if (from == null || to == null || from === '' || to === '') {
        this.clearError(fromControl, 'fromGreaterThanTo');
        this.clearError(toControl, 'fromGreaterThanTo');
        return null;
      }

      // Nếu from >= to thì gán lỗi vào control đang thao tác (dirty)
      if (+from >= +to) {
        const activeControl = toControl.dirty ? toControl : fromControl;
        activeControl.setErrors({ ...(activeControl.errors || {}), fromGreaterThanTo: true });
        return { fromGreaterThanTo: true };
      } else {
        // Xóa lỗi nếu hợp lệ
        this.clearError(fromControl, 'fromGreaterThanTo');
        this.clearError(toControl, 'fromGreaterThanTo');
        return null;
      }
    };
  }

  private clearError(control: AbstractControl | null, key: string) {
    if (!control || !control.errors) return;
    const { [key]: _, ...rest } = control.errors;
    control.setErrors(Object.keys(rest).length ? rest : null);
  }

  onSubmit() {
    this.matDialogRef.close(this.addEditForm.value)
  }
}
