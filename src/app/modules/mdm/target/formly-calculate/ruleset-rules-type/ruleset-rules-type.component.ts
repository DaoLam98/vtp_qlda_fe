import { Component, ViewEncapsulation } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActionTypeEnum, SharedModule } from 'src/app/shared';
import {FieldArrayType, FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import {
  createFormlyRuleAndOr,
  createFormlyRuleCalculate, createFormlyRuleIf,
  createFormlyRulesetCalculate, RuleOptions,
} from 'src/app/modules/mdm/target/formly-calculate/ultis';
import { ActivatedRoute } from '@angular/router';
import { TargetService } from 'src/app/core/services/target.service';

@Component({
  selector: 'ruleset-rules-type',
  templateUrl: './ruleset-rules-type.component.html',
  styleUrls: ['./ruleset-rules-type.component.scss'],
  imports: [
    SharedModule,
    FormlyModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class RulesetRulesTypeComponent extends FieldArrayType {
  isView = false;
  constructor(
    protected activatedRoute: ActivatedRoute,
    protected targetService: TargetService,
  ) {
      super();
    this.isView = this.activatedRoute.routeConfig?.data?.actionType === ActionTypeEnum._VIEW;
  }

  prePopulate(field: FormlyFieldConfig) {
    if (!field.parent || !field.model) return;

    field.fieldGroup = field.fieldGroup || [];
    const formArray = field.formControl as FormArray;

    this.removeExtraFieldGroups(field, formArray);

    for (let i = field.fieldGroup.length; i < field.model.length; i++) {
      const modelItem = field.model[i];
      let ruleField: FormlyFieldConfig;

      if (!modelItem?.isRuleset) {
        if (!field.options) continue;
        const { ruleOptions } = field.options.formState;

        ruleField = this.createRuleField(modelItem, i, ruleOptions);
        const extraGroups = this.createExtraGroups(modelItem, ruleOptions);
        if (ruleField.fieldGroup) {
          ruleField.fieldGroup.push(...extraGroups);
        }
      } else {
        ruleField = this.createRulesetField(modelItem, i);
      }

      field.fieldGroup.push(ruleField);
    }
  }

  private removeExtraFieldGroups(field: FormlyFieldConfig, formArray: FormArray) {
    if (!field.model || !field.fieldGroup) return;

    for (let i = field.fieldGroup.length - 1; i >= field.model.length; i--) {
      formArray.removeAt(i);
      field.fieldGroup.splice(i, 1);
    }
  }

  private createRuleField(modelItem: any, index: number, ruleOptions: any): FormlyFieldConfig {
    let fieldGroup: FormlyFieldConfig[] = [];

    switch (modelItem.typeFunc) {
      case 'if':
        fieldGroup = createFormlyRuleIf(ruleOptions, this.targetService.translate.value);
        break;
      case 'and':
      case 'or':
        if (!modelItem.itemId) break;
        fieldGroup = createFormlyRuleAndOr(ruleOptions, this.targetService.translate.value);
        break;
      default:
        fieldGroup = createFormlyRuleCalculate(ruleOptions, this.targetService.translate.value);
        break;
    }

    return {
      key: `${index}`,
      id: modelItem?.itemId ?? '',
      fieldGroup: [...fieldGroup],
    };
  }

  private createExtraGroups(modelItem: any, ruleOptions: any): FormlyFieldConfig[] {
    const extraGroups: FormlyFieldConfig[] = [];
    let index = 1;

    while (modelItem[`operator_${index}`] || modelItem[`type_${index}`] || modelItem[`value_${index}`]) {
      const operatorField: FormlyFieldConfig = {
        key: `operator_${index}`,
        type: 'select',
        defaultValue: '+',
        className: 'w-20',
        templateOptions: {
          required: true,
          placeholder: 'Op',
          options: [
            { value: '+', label: '+' },
            { value: '-', label: '-' },
            { value: '*', label: '*' },
            { value: '/', label: '/' },
          ],
        },
      };

      const typeSelector: FormlyFieldConfig = {
        key: `type_${index}`,
        type: 'select',
        className: 'add-selector',
        templateOptions: {
          required: true,
          placeholder: 'Chọn loại',
          options: ruleOptions?.fields?.map((f: any) => ({ value: f.value, label: f.label })) ?? [],
        },
      };

      const valueFieldGroup: FormlyFieldConfig[] = ruleOptions?.fields?.map(({ value, valueField }: any) => ({
        key: `value_${index}`,
        hideExpression: `model['type_${index}'] !== '${value}'`,
        ...valueField,
        className: 'add-selector',
      })) ?? [];

      extraGroups.push({
        fieldGroupClassName: 'flex items-center gap-2',
        fieldGroup: [operatorField, typeSelector, ...valueFieldGroup],
      });

      index++;
    }

    return extraGroups;
  }

  private createRulesetField(modelItem: any, index: number): FormlyFieldConfig {
    const isDetail = window.location.href.includes('/detail');
    return {
      key: `${index}`,
      id: modelItem?.itemId ?? '',
      fieldGroup: [...createFormlyRulesetCalculate('', '', isDetail, this.targetService.translate.value)],
    };
  }

}
