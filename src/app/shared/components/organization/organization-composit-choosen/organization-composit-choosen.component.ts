import {AfterViewInit, Component, forwardRef, Injector, Input} from '@angular/core';
import {SelectModel} from '@c10t/nice-component-library';
import {MatDialog} from '@angular/material/dialog';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {PopupChooseOrganizationComponent} from '../organization-popup-choosen/organization-popup-choosen.component';

@Component({
  selector: 'app-organization-composit-choosen',
  templateUrl: './organization-composit-choosen.component.html',
  styleUrl: './organization-composit-choosen.component.scss',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompositeChooseOrganizationComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CompositeChooseOrganizationComponent),
      multi: true,
    }
  ]
})
export class CompositeChooseOrganizationComponent implements ControlValueAccessor, Validator, AfterViewInit {
  @Input() fieldName?: string = 'organization';
  @Input() listOrg?: SelectModel[] = [];
  @Input() multiple?: boolean = false;
  @Input() selected?: SelectModel[];
  @Input() required?: boolean = false;
  @Input() disabled?: boolean = false;

  organizationControl = new FormControl();

  constructor(
    public matDialog: MatDialog,
    private injector: Injector,
  ) {
    this.organizationControl.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const ngControl = this.injector.get(NgControl, null);
      const parentControl = ngControl?.control as AbstractControl | null;
      if(!parentControl) return;
      parentControl.statusChanges?.subscribe(() => {
        if(parentControl.dirty && !this.organizationControl.dirty) {
          this.organizationControl.markAsDirty({onlySelf: true});
        }
        if(parentControl.touched && !this.organizationControl.touched) {
          this.organizationControl.markAsTouched({onlySelf: true});
        }
      });
    });
  }

  select(): void {
    this.matDialog
      .open(PopupChooseOrganizationComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          selected: this.listOrg?.filter((x: SelectModel) => x.value == this.organizationControl.value)
            .map((x: SelectModel) => {
              return {
                ...x,
                id: x.rawData.id,
                code: x.rawData.code,
                name: x.displayValue,
                checked: true,
              }
            }),
          multiple: this.multiple,
          trackBy: 'id',
          comboboxValues: this.listOrg,
        },
      })
      .afterClosed()
      .subscribe((selectedOrg: any[]) => {
        if(selectedOrg && selectedOrg.length > 0) {
          this.selected = selectedOrg.map((x: any) => {
            return new SelectModel(x.id, x.name, false, x)
          })
          // Cập nhật giá trị cho internalUserControl
          this.organizationControl.setValue(selectedOrg[0].id);

          // Gọi onChange để thông báo cho formControl cha biết giá trị đã thay đổi
          this.onChange(selectedOrg[0].id);
        }
      });
  }

  writeValue(value: any): void {
    this.organizationControl.setValue(value, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if(isDisabled) {
      this.organizationControl.disable();
    } else {
      this.organizationControl.enable();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if(this.required && (control.value === null || control.value === undefined || control.value === '')) {
      return {required: true};
    }
    return null;
  }

  private onChange: (value: any) => void = () => {
  };

  private onTouched: () => void = () => {
  };
}
