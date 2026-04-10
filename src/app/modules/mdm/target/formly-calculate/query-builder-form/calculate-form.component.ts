import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import {createFormlyRulesetCalculate, RuleOptions} from 'src/app/modules/mdm/target/formly-calculate/ultis';
import { TranslateService } from '@ngx-translate/core';
import { TargetService } from 'src/app/core/services/target.service';

@Component({
  selector: 'app-calculate-form',
  templateUrl: './calculate-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormlyModule
  ]
})
export class CalculateFormComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() model: any;
  @Input() ruleOptions: RuleOptions | undefined;
  @Input() isView = false;
  fields: FormlyFieldConfig[] = []
  constructor(
    private translateService: TranslateService,
    private targetService: TargetService
  ) {
  }

  ngOnInit() {
    const translate = {
      selectFormula: this.translateService.instant('common.selectFormula'),
      selectCalculation: this.translateService.instant('common.selectCalculation'),
      selectValue: this.translateService.instant('common.selectValue'),
      inputValue: this.translateService.instant('common.inputValue'),
      compare: this.translateService.instant('common.compare'),
      expression: this.translateService.instant('common.expression'),
      function: this.translateService.instant('common.function'),
    }
    this.targetService.translate.next(translate)
    this.fields = [...createFormlyRulesetCalculate('', '', this.isView, translate)];
  }
}
