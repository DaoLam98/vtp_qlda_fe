import {BaseModel} from '@c10t/nice-component-library';
import {LanguageModel} from './language.model';

export class TranslationValueModel extends BaseModel {
  languageId: number = 0;
  languageEntity!: LanguageModel;
  value: string = '';
  translationKeyId: number = 0;
  status: 'APPROVED' | 'DRAFT' | 'REJECTED' = 'APPROVED';
}
