import {
  Component, OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActionTypeEnum, SharedModule } from 'src/app/shared';
import {FieldType, FormlyModule} from '@ngx-formly/core';
import {
  createRule, createRuleAndOr,
  createRuleIf,
  createRuleset,
} from 'src/app/modules/mdm/target/formly-calculate/ultis';
import { pairwise, startWith, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ruleset-type',
  templateUrl: './ruleset-type.component.html',
  styleUrls: ['./ruleset-type.component.scss'],
  imports: [
    SharedModule,
    FormlyModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class RulesetTypeComponent extends FieldType implements OnInit {

  subscriptions: Subscription[] = [];
  isAddingRule = false;
  isView = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
  ) {
    super();
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  ngOnInit(): void {
    const subAll = this.form.valueChanges
      .pipe(startWith(this.form.value), pairwise())
      .subscribe(([prev, curr]) => {
        if (this.isAddingRule) return;
        if (prev.typeExpression !== curr.typeExpression || prev.condition !== curr.condition) {
          const isCurrFunction =
            curr.typeExpression === 'function' && curr.condition === 'if';

          if (isCurrFunction) {
            if (Array.isArray(this.model.rules)) {
              this.model.rules = [];
            }
            (this.options as any).build();
            this.addRuleIf();
          } else {
            if (Array.isArray(this.model.rules)) {
              this.model.rules = [];
            }
              (this.options as any).build();

          }
        }
      });

    this.subscriptions.push(subAll);
  }

  addRuleset() {
    if (this.model.typeExpression === 'function' && this.model.condition === 'and') {
      this.model.rules.push(createRuleset())
    } else {
      this.model.rules.push(createRuleset());
    }
    (this.options as any).build();
  }

  addRule() {
    if (this.model.typeExpression === 'function' && (this.model.condition === 'and' || this.model.condition === 'or')) {
      this.model.rules.push(createRuleAndOr())
    } else {
      this.model.rules.push(createRule());
    }

    (this.options as any).build();
  }

  checkData() {
    return this.model.condition === '' || (this.model.typeExpression === 'function' && this.model.condition === 'if') || this.isView;
  }
  addRuleIf() {
    this.isAddingRule = true; // tránh trigger lại valueChanges
    this.model.rules.push(createRuleIf());
    (this.options as any).build();
    setTimeout(() => (this.isAddingRule = false)); // mở lại sau 1 lần call
  }
}
