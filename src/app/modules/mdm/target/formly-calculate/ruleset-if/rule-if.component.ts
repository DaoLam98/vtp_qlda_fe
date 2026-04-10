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
    selector: 'rule-if',
    templateUrl: './rule-if.component.html',
    styleUrls: ['./rule-if.component.scss'],
    imports: [
        SharedModule,
        FormlyModule,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class RuleIfComponent extends FieldType implements OnInit {

    ruleRef: any;
    isView = false;
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

    ngOnInit(): void {
      const subAll = this.form.valueChanges
        .pipe(startWith(this.form.value), pairwise())
        .subscribe(([prev, curr]) => {
          if (this.isAddingRule) return;

          this.handleRuleFieldChange(prev, curr, 'if');
          this.handleRuleFieldChange(prev, curr, 'then');
          this.handleRuleFieldChange(prev, curr, 'else');
        });

        this.subscriptions.push(subAll);
    }

  private handleRuleFieldChange(prev: any, curr: any, field: 'if' | 'then' | 'else') {
    const fieldName = `${field}Field`;
    const valueName = `${field}Value`;

    if (prev[fieldName] !== curr[fieldName] || prev[valueName] !== curr[valueName]) {
      const isCurrFunction = curr[fieldName] === 'function' && curr[valueName] === 'if';

      if (isCurrFunction) {
        this.markRulesAsDeleted(field);
        this.addRuleIfFunc(field);
      } else {
        const before = this.model.rules?.length || 0;
        this.markRulesAsDeleted(field);
        if ((this.model.rules?.length || 0) !== before) {
          (this.options as any).build();
        }
      }
    }
  }

  private markRulesAsDeleted(field: 'if' | 'then' | 'else') {
    if (Array.isArray(this.model.rules) && this.model.rules.length > 0) {
      this.model.rules = this.model.rules.map((r: any) => {
        if (r.func === field || r.funcType === field) {
          return { ...r, isDelete: true };
        }
        return r;
      });
    } else {
      this.model.rules = [];
    }
    (this.options as any).build();
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

    checkFunc(data: any, type: string): boolean {
        return (data?.funcType === type || data?.func === type) && !data.isDelete;
    }

    getRulesIf() {
        const rules = this.groupedFields.rules ?? [];
        return rules.filter(
            (r: any) => Array.isArray(r.fieldGroup) && r.fieldGroup.length > 0,
        );
    }

    get groupedFields() {

        if (!this.field?.fieldGroup) return {};

        const groups: Record<string, any[]> = { if: [], compare: [], then: [], else: [], rules: [] };

        for (const f of this.field.fieldGroup) {
            const key = f.key?.toString() || '';
            if (key.startsWith('if')) groups.if.push(f);
            else if (key.startsWith('then')) groups.then.push(f);
            else if (key.startsWith('else')) groups.else.push(f);
            else if (key.startsWith('rules')) groups.rules.push(f);
            else if (key.startsWith('compare')) groups.compare.push(f);
            else groups.compare.push(f);
        }

        return groups;
    }

    addRulesetFunc(type: string) {
        if (!this.model.rules) this.model.rules = [];
        this.model.rules.push(createRuleset(type));
        (this.options as any).build();
    }


    addRule(type: string, field?: any) {
        if (!this.model.rules) this.model.rules = [];
        if(this.model[field] === 'and' || this.model[field] === 'or') {
          this.model.rules.push(createRuleAndOr(type));
        } else {
          this.model.rules.push(createRule(type));
        }
        (this.options as any).build();
    }

    addRuleIfFunc(type: string) {
        this.isAddingRule = true; // 🔒 tránh trigger lại valueChanges
        this.model.rules.push(createRuleIf(type));
        (this.options as any).build();
        setTimeout(() => (this.isAddingRule = false)); // 🔓 mở lại sau 1 tick
    }

    removeItem(itemToRemove: any) {
      itemToRemove.value = '';
      itemToRemove.isDelete = true;
      (this.options as any).build();
    }
}
