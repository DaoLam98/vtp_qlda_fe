import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * @description Directive dùng cho `<cva-input type="number" />` vì `maxlength` không hoạt động với input type number
 */

@Directive({
  selector: '[appBlockMaxLength]',
  standalone: false,
})
export class BlockMaxLengthDirective {
  /**
   * @description Cho phép nhập tối đa `maxLength` ký tự
   */
  @Input('appBlockMaxLength') maxLength: number = 0;

  constructor(private ngControl: NgControl) {}

  // Chặn nhập khi đạt đến maxLength
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.ngControl || !this.ngControl.control) return;

    const value = this.ngControl.control.value || '';
    // Cho phép các phím điều hướng và xóa
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    if (value.length >= this.maxLength) {
      event.preventDefault();
    }
  }

  // Chặn paste khi vượt quá maxLength
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!this.ngControl || !this.ngControl.control) return;
    const value = this.ngControl.control.value || '';
    if (value.length > this.maxLength) {
      event.preventDefault();
      this.ngControl.control.setValue(null);
    }
  }
}
