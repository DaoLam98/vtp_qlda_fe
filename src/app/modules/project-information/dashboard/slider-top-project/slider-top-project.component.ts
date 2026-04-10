import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import {RankingProjectModel} from "src/app/modules/project-information/models/ranking-project.model";

@Component({
  selector: 'app-slider-top-project',
  standalone: false,
  templateUrl: './slider-top-project.component.html',
  styleUrls: ['./slider-top-project.component.scss'],
})
export class SliderTopProjectComponent {
  @Input() items: RankingProjectModel[] = [];
  @Input() visible = 3;

  @ContentChild('itemTpl', { read: TemplateRef }) itemTpl?: TemplateRef<any>;

  index = 0;

  get maxIndex(): number {
    return Math.max(0, Math.ceil(this.items.length - this.visible));
  }

  get pages(): number[] {
    return Array.from({ length: this.maxIndex + 1 }, (_, i) => i);
  }

  get transformStyle(): string {
    const percent = (100 / this.visible) * this.index;
    return `translateX(-${percent}%)`;
  }

  prev(): void { this.index = Math.max(0, this.index - 1); }
  next(): void { this.index = Math.min(this.maxIndex, this.index + 1); }
  canPrev(): boolean { return this.index > 0; }
  canNext(): boolean { return this.index < this.maxIndex; }
  goTo(i: number): void { this.index = Math.min(this.maxIndex, Math.max(0, i)); }
}
