import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {AuthoritiesService, ButtonModel, DateUtilService} from '@c10t/nice-component-library';

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
export interface TreeNode {
  id: number;
  name: string;
  description: string;
  baseUnit: string;
  frequencyType?: number;
  startDate?: string;
  endDate?: string;
  weight?: number;
  arise?: number;
  children?: TreeNode[];
  kpiValue?: number;
  realityValue?: number;
  picUsername?: string;
  assignUsername?: string;
  lifeCycle?: string;
  unitOfCycle?: string;
  picEmployeeName?: string;
  assignEmployeeName?: string;
}

interface FlatNode {
  id: number;
  expandable: boolean;
  name: string;
  description: string;
  level: number;
  baseUnit: string;
  frequencyType?: number;
  startDate?: string;
  endDate?: string;
  weight?: number;
  arise?: number;
  kpiValue?: number;
  realityValue?: number;
  picUsername?: string;
  assignUsername?: string;
  lifeCycle?: string;
  unitOfCycle?: string;
  picEmployeeName?: string;
  assignEmployeeName?: string;
}

/**
 * @title Tree with flat nodes (childrenAccessor)
 */
@Component({
  selector: 'tree-table',
  // imports: [MatTreeModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: 'tree-table.component.html',
  styleUrls: ['./tree-table.component.scss']
})
export class TreeTable<T> {
  @Input() viewScreen!: string
  @Input() actions!: ButtonModel[]
  @Input() displayedColumns!: string[]
  @Output() buttonClicked = new EventEmitter<{ action: string; record: any }>();
  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  );

  _dataItem: TreeNode[] = [];

  get dataItem(): TreeNode[] {
    return this._dataItem;
  }

  @Input() set dataItem(value: TreeNode[]) {
    this._dataItem = value;
    this.dataSource.data = this.dataItem;
  }

  constructor(protected dateUtilService: DateUtilService, private authoritiesService: AuthoritiesService) {
    console.log(this._dataItem);

  }

  onButtonClick(action: string, record: any) {
    this.buttonClicked.emit({
      action,
      record
    });
  }

  click = (data1: any) => {
    console.log(data1, this.dataSource)
  }

  private transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      description: node.description,
      baseUnit: node.baseUnit,
      frequencyType: node.frequencyType,
      startDate: node.startDate ? this.dateUtilService.convertDateToDisplayServerTime(node.startDate) : '',
      endDate: node.endDate ? this.dateUtilService.convertDateToDisplayServerTime(node.endDate) : '',
      weight: node.weight,
      arise: node.arise,
      kpiValue: node.kpiValue,
      realityValue: node.realityValue,
      level,
      id: node.id,
      picUsername: node.picUsername,
      assignUsername: node.assignUsername,
      lifeCycle: node.lifeCycle,
      unitOfCycle: node.unitOfCycle,
      picEmployeeName: node.picEmployeeName,
      assignEmployeeName: node.assignEmployeeName
    };
  };

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );
  // @ts-ignore
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
}
