import {Directive, HostListener, Input} from '@angular/core';
import {MatExpansionPanel} from '@angular/material/expansion';

@Directive({
  selector: '[expandPanelAction]',
  standalone: false,
})

export class ExpandPanelActionDirective {
  /** Panel can su dung có thể truyền trực tiếp mat panel instance (#panel) hoặc inject qua input */
  @Input('expandPanelAction') panel!: MatExpansionPanel;

  /** Hàm được gọi sau khi đảm bảo panel đã mở */
  @Input() expandPanelActionFn?: () => void;

  /** chặn event để không toggle panel qua header */
  @Input() expandPanelPreventToggle: boolean = true;

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    this.run(e);
  }

  @HostListener('keydown.enter', ['$event'])
  onEnter(e: KeyboardEvent) {
    this.run(e);
  }

  @HostListener('keydown.space', ['$event'])
  onSpace(e: KeyboardEvent) {
    this.run(e);
  }

  private run(e: Event) {
    if(this.expandPanelPreventToggle) {
      e.stopPropagation();
      if(e instanceof KeyboardEvent) e.preventDefault();
    }

    if(this.panel && !this.panel.expanded) {
      this.panel.open();
    }

    this.expandPanelActionFn?.();
  }
}
