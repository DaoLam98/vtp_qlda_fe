import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appBlockChars]',
  standalone: false,
})
export class BlockCharsDirective {
  /**
   * @description Chặn nhập các ký tự trong mảng blockChars
   */
  @Input('appBlockChars') blockChars: string[] = [];

  constructor(private ngControl: NgControl) {}

  // Chặn nhập các ký tự bị chặn
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.blockChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  // Chặn paste các ký tự bị chặn
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (!event.clipboardData || !this.ngControl || !this.ngControl.control) return;
    const pastedData = event.clipboardData.getData('text');
    if (this.blockChars.some((char) => pastedData.includes(char))) {
      event.preventDefault();
      this.ngControl.control.setValue(null);
    }
  }
}
