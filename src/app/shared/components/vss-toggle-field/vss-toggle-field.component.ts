import {booleanAttribute, Component, Input, OnChanges, Optional, Self, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NgControl} from '@angular/forms';

@Component({
  selector: 'app-vss-toggle-field',
  standalone: false,
  templateUrl: './vss-toggle-field.component.html',
  styleUrl: './vss-toggle-field.component.scss',
})
export class VssToggleFieldComponent implements OnChanges, ControlValueAccessor {
  @Input() label = '';
  @Input() isDisabled: boolean = false;
  @Input() displayType: 'horizontal' | 'vertical' = 'vertical'
  @Input({transform: booleanAttribute}) isInForm: boolean = true;

  value: boolean = false;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if(this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['isDisabled']) {
      const action = changes['isDisabled'].currentValue ? 'disable' : 'enable';
      this.ngControl?.control?.[action]();
    }
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.checked;
    this.onChange(this.value);
    this.onTouched();
  }

  private onChange: (value: boolean) => void = () => {
  };

  private onTouched: () => void = () => {
  };
}
