import {Injectable} from '@angular/core';
import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {UploadModel} from '@c10t/nice-component-library';

@Injectable({providedIn: 'root'})
export class ImageUtil {
  static validatorFile(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if(!control.value) {
        return null;
      }
      const result = (control?.value as []).every((f: any) => {
        return !f.imageUrl;
      });
      if(result) {
        return {required: true};
      }
      return null;
    };
  }

  static getFileList(control: AbstractControl, param: string, formData: FormData): number[] {
    const files = control?.value;
    if(!files || !files.length) {
      return [];
    }
    const returnFiles: number[] = [];
    // tslint:disable-next-line:prefer-for-of
    for(let i = 0; i < files.length; i++) {
      let upload = files[i].imageUrl as UploadModel;
      if(!upload) {
        continue;
      }
      if(Array.isArray(upload)) {
        upload = upload[0];
      }
      if(upload.binary) {
        formData.append(param, upload.binary, upload.name);
      } else if(upload.id) {
        returnFiles.push(upload.id);
      }
    }
    return returnFiles;
  }

  static getFile(control: AbstractControl, param: string, formData: FormData): boolean {
    const file = control?.value;
    if(!file || !file.length) {
      return false;
    }
    // tslint:disable-next-line:prefer-for-of
    let upload = file as UploadModel;
    if(Array.isArray(upload)) {
      upload = upload[0];
    }
    if(upload.binary) {
      formData.append(param, upload.binary, upload.name);
    }
    return true;
  }

}
