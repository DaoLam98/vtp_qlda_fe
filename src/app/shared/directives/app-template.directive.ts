import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
  selector: '[appTemplate]',
  standalone: false
})
export class AppTemplateDirective {
  @Input('appTemplate') type!: string;

  constructor(public template: TemplateRef<any>) {
  }

}
