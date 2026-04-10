import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

// Import Quill và module image resizor
import Quill from 'quill';
import ImageResizor from 'quill-image-resizor';

// Đăng ký module image resizor
Quill.register('modules/imageResize', ImageResizor);

if(environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

function _window(): any {
  return window;
}

// Gán Quill vào đối tượng window
_window().Quill = Quill;
_window().quill = Quill;
