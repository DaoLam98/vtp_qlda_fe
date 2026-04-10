import {Component, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {HashTagDetailModel} from 'src/app/shared/models/hash-tag.model';

@Component({
  selector: 'app-vss-hashtags-field',
  standalone: false,
  templateUrl: './vss-hashtags-field.component.html',
  styleUrl: './vss-hashtags-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VssHashtagsFieldComponent),
      multi: true,
    },
  ],
})
export class VssHashtagsFieldComponent implements OnChanges {
  @Input() options: any[] = [];
  @Input() expandObject: any;
  @Input() isView?: boolean;
  tagCtrl = new FormControl('');
  selectedOptions: any[] = [];
  value: any[] = []

  get filteredTags(): string[] {
    const value = this.tagCtrl.value?.toLowerCase() || '';
    return this.options.filter(
      (option) => option.name.toLowerCase().includes(value) && !this.selectedOptions.includes(option));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if('options' in changes) {
      this.setSelectedOptions(this.value);
    }
  }

  selectOption(option: string) {
    if(!this.selectedOptions.includes(option)) {
      this.selectedOptions.push(option);
    }
    this.onChange(this.convertHashtag(this.selectedOptions));
    this.tagCtrl.setValue('');
  }

  remove(tag: string) {
    const index = this.selectedOptions.indexOf(tag);
    if(index >= 0) {
      this.selectedOptions.splice(index, 1);
      this.onChange(this.convertHashtag(this.selectedOptions));
    }
  }

  handleManualAdd() {
    this.tagCtrl.setValue('');
  }

  convertHashtag(selectedOptions: any): any {
    return selectedOptions.map((item: HashTagDetailModel) => ({
      hashtagId: item.id,
      hashtagName: item.name,
      hashtagCode: item.code,
      ...this.expandObject
    }));
  }

  setSelectedOptions(hashtags: any[]): any {
    if(!hashtags || hashtags.length === 0 || !this.options || this.options.length === 0) {
      return
    }
    hashtags.forEach((hashtag: any) => {
      const option = this.options.find((option: any) => option.id === hashtag.hashtagId);
      if(option && !this.selectedOptions.includes(option)) {
        this.selectedOptions.push(option);
      }
    })
  }

  private onChange: (value: any) => void = () => {
  };
}
