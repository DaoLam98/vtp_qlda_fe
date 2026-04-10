import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {SharedModule} from 'src/app/shared';
import {FieldType, FormlyModule} from '@ngx-formly/core';
import { TargetService } from 'src/app/core/services/target.service';

@Component({
  selector: 'ruleset-type',
  templateUrl: './rule-type.component.html',
  styleUrls: ['./rule-type.component.scss'],
  imports: [
    SharedModule,
    FormlyModule
  ],
})
export class RuleTypeComponent extends FieldType implements OnInit {
  ruleRef: any;
  constructor(
    private cdr: ChangeDetectorRef,
    private targetService: TargetService,
    ) {
    super();
  }

  getTitle(data: any): string {
    let title = ''
    if(this.ruleRef && this.ruleRef?.length) {
      title = this.ruleRef.find((item: any) =>
        item?.value === this.model?.field)?.label;
    }
    const referenceTable = this.ruleRef.find((item: any) =>item.value === this.model?.field);
    let valueTitle = this.model?.value
    if (referenceTable && referenceTable.valueField?.templateOptions?.options) {
      valueTitle = referenceTable.valueField?.templateOptions?.options.find((otp: any) => otp.value === this.model?.value)?.label;
    }
    return data?.key ? title : valueTitle
  }
  async ngOnInit() {
    this.ruleRef = this.targetService.selectOption.value;
    this.cdr.detectChanges();
  }
}

