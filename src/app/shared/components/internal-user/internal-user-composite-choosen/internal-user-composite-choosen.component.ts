import {Component, forwardRef, Input} from '@angular/core';
import {SelectModel} from '@c10t/nice-component-library';
import {
  PopupChooseUserComponent
} from 'src/app/shared/components/internal-user/popup-choose-user/popup-choose-user.component';
import {MatDialog} from '@angular/material/dialog';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-internal-user-composite-choosen',
  templateUrl: './internal-user-composite-choosen.component.html',
  styleUrl: './internal-user-composite-choosen.component.scss',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CompositeChooseInternalUserComponent),
      multi: true,
    }
  ]
})
export class CompositeChooseInternalUserComponent implements ControlValueAccessor {
  @Input() fieldName?: string = 'lastModifiedBy';
  @Input() listUser?: SelectModel[] = [];
  @Input() multiple?: boolean = false;
  @Input() selected?: SelectModel[];
  @Input() required?: boolean = false;
  @Input() disabled?: boolean = false;
  @Input() bindValue = 'userName';

  internalUserControl = new FormControl();

  constructor(
    public matDialog: MatDialog,
  ) {
    this.internalUserControl.valueChanges.subscribe(value => {
      this.onChange(value);
    });
  }

  select(): void {
    this.matDialog
      .open(PopupChooseUserComponent, {
        disableClose: false,
        width: '1500px',
        maxWidth: '100vw',
        maxHeight: '90vh',
        data: {
          selected: this.listUser?.filter((x: SelectModel) => x.value == this.internalUserControl.value)
            .map((x: SelectModel) => {
              return {
                ...x,
                id: x.rawData.id,
                code: x.rawData.code,
                userName: x.value,
                checked: true,
                fullName: x.rawData.fullName
              }
            }),
          trackBy: 'id',
          multiple: this.multiple,
        },
      })
      .afterClosed()
      .subscribe((selectedUsers: any[]) => {
        if(selectedUsers && selectedUsers.length > 0) {
          this.selected = selectedUsers.map((x: any) => {
            return new SelectModel(x.id, x.fullName + "(" + x.userName + ")", false, x)
          })
          // Cập nhật giá trị cho internalUserControl
          this.internalUserControl.setValue(selectedUsers[0][this.bindValue]);

          // Gọi onChange để thông báo cho formControl cha biết giá trị đã thay đổi
          this.onChange(selectedUsers[0][this.bindValue]);
        }
      });
  }

  writeValue(value: any): void {
    this.internalUserControl.setValue(value, {emitEvent: false});
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if(isDisabled) {
      this.internalUserControl.disable();
    } else {
      this.internalUserControl.enable();
    }
  }

  private onChange: (value: any) => void = () => {
  };

  private onTouched: () => void = () => {
  };
}
