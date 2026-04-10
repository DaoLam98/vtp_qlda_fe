import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionTypeEnum, SharedModule } from 'src/app/shared';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import {
  createRule, createRuleAndOr,
  createRuleIf,
  createRuleset,
} from 'src/app/modules/mdm/target/formly-calculate/ultis';
import { pairwise, startWith, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TargetService } from 'src/app/core/services/target.service';

@Component({
  selector: 'rule-and-or',
  templateUrl: './rule-and-or.component.html',
  styleUrls: ['./rule-and-or.component.scss'],
  imports: [
    SharedModule,
    FormlyModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class RuleAndOrComponent extends FieldType implements OnInit {

  isView = false;
  ruleRef: any;
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected targetService: TargetService,
  ) {
    super();
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
    this.ruleRef = this.targetService.selectOption.value;
  }

  subscriptions: Subscription[] = [];
  isAddingRule = false;
  isRebuildingForm = false;

  ngOnInit(): void {
    const subAll = this.form.valueChanges
      .pipe(startWith(this.form.value), pairwise())
      .subscribe(([prev, curr]) => {
        if (this.isRebuildingForm) return;

        if (prev.typeExpression !== curr.typeExpression || prev.condition !== curr.condition) {
          const isCurrIfFunction =
            curr.typeExpression === 'function' && curr.condition === 'if';

          this.isRebuildingForm = true;
          if (isCurrIfFunction) {
            this.model.rules = [];
            (this.options as any).build();
            this.addRuleIfFunc('if');
          } else {
            if (this.model && this.model?.rules) this.model.rules = [];
            (this.options as any).build();
          }
          setTimeout(() => (this.isRebuildingForm = false));
        }
      });
    this.subscriptions.push(subAll);
  }

  getTitle(data: any): string {
    let title = ''
    if(this.ruleRef && this.ruleRef?.length) {
      title = this.ruleRef.find((item: any) =>
        item?.value === this.model?.compare)?.label;
    }
    const referenceTable = this.ruleRef.find((item: any) =>item.value === this.model?.compare);
    let valueTitle = this.model?.value
    if (referenceTable && referenceTable.valueField?.templateOptions?.options) {
      valueTitle = referenceTable.valueField?.templateOptions?.options.find((otp: any) => otp.value === this.model?.value)?.label;
    }
    return data?.key === 'compare' ? title : valueTitle
  }

  getRulesIf() {
    const rules = this.groupedFields.rules ?? [];
    return rules.filter(
      (r: any) => Array.isArray(r.fieldGroup) && r.fieldGroup.length > 0,
    );
  }

  get groupedFields() {
    if (!this.field?.fieldGroup) return {};

    const groups: Record<string, any[]> = { select: [], compare: [], rules: [] };

    for (const f of this.field.fieldGroup) {
      const key = f.key?.toString() || '';
      if (key.startsWith('typeExpression')) groups.select.push(f);
      if (key.startsWith('condition')) groups.select.push(f);
      else if (key.startsWith('rules')) groups.rules.push(f);
      else if (key.startsWith('compare')) groups.compare.push(f);
      else if (!key) groups.compare.push(f);
    }
    return groups;
  }

  addRulesetFunc(type: string) {
    if (!this.model.rules) this.model.rules = [];
    this.model.rules.push(createRuleset(type));
    (this.options as any).build();
  }


  addRule() {
    if (!this.model.rules) this.model.rules = [];
    if (this.model.typeExpression === 'function' && this.model.condition === 'and') {
      this.model.rules.push(createRuleAndOr());
    } else {
      this.model.rules.push(createRule());
    }
    (this.options as any).build();
  }

  addRuleIfFunc(type: string) {
    this.isAddingRule = true;
    this.model.rules.push(createRuleIf(type));
    (this.options as any).build();
    setTimeout(() => (this.isAddingRule = false));
  }

  checkFunc(data: any,): boolean {
    return !data.isDelete;
  }

  removeItem(itemToRemove: any) {
    itemToRemove.value = '';
    itemToRemove.isDelete = true;
    (this.options as any).build();
  }
}
