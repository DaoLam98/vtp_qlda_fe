import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-images-carousel',
  standalone: false,
  templateUrl: './images-carousel.component.html',
  styleUrl: './images-carousel.component.scss',
})
export class ImagesCarouselComponent {
  @Input() images: string[] = [];
  @Input() height = 500;
  index = 0;

  next() {
    if(this.index == this.images.length - 1) {
      this.index = 0;
    } else {
      this.index += 1;
    }
  }

  prev() {
    if(this.index == 0) {
      this.index = this.images.length - 1;
    } else {
      this.index -= 1;
    }
  }
}
