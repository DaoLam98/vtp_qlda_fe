import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';

import { RulesetTypeComponent } from './ruleset-type/ruleset-type.component';
import { RulesetRulesTypeComponent } from './ruleset-rules-type/ruleset-rules-type.component';
import { RuleTypeComponent } from './rule-type/rule-type.component';
import { CalculateFormComponent } from './query-builder-form/calculate-form.component';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {
  RuleIfComponent
} from 'src/app/modules/mdm/target/formly-calculate/ruleset-if/rule-if.component';
import {
  RuleAndOrComponent
} from 'src/app/modules/mdm/target/formly-calculate/rule-and-or/rule-and-or.component';

@NgModule({
  imports: [
    CommonModule,
    FormlyModule.forChild({
      types: [
        {name: 'rule', component: RuleTypeComponent},
        {name: 'rule-if', component: RuleIfComponent},
        {name: 'rule-and-or', component: RuleAndOrComponent},
        {name: 'ruleset', component: RulesetTypeComponent},
        {name: 'ruleset-rules', component: RulesetRulesTypeComponent},
      ],
    }),
    FormlyMaterialModule,
    RulesetTypeComponent,
    RulesetRulesTypeComponent,
    RuleTypeComponent,
    CalculateFormComponent,
    RuleIfComponent,
    RuleAndOrComponent,
  ],
  declarations: [

  ],
  exports: [CalculateFormComponent],
})
export class FormlyCalculateModule {
}
