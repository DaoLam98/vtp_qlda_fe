import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {NavigatorModel} from '@c10t/nice-component-library';
import {NavService} from 'src/app/core';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ]),
  ],
  standalone: false,
})
export class MenuListItemComponent implements OnInit {
  @HostBinding('attr.aria-expanded') ariaExpanded: boolean | undefined;
  @Input() item: NavigatorModel | undefined;
  @Input() depth: number | undefined;

  constructor(public navService: NavService,
              public router: Router) {
    if(this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {
    this.navService.currentUrl.subscribe((url: string) => {
      if(this.item)
        if(this.item.route && url) {
          this.item.expanded = this.item.route ? this.router.isActive(this.item.route, true) : false;
          this.ariaExpanded = this.item.expanded;
        }
    });
  }

  onItemSelected(item: NavigatorModel | undefined) {
    if(item) {
      if(!item.children || !item.children.length) {
        this.navService.title = item.displayName;
        this.router.navigate([item.route]);
      }
      if(this.item)
        if(item.children && item.children.length) {
          this.item.expanded = !this.item.expanded;
        }
    }

  }
}
