export interface CustomizeTaskModel {
  implementation: string | undefined;
  delegateExpression: string | undefined;
  asyncBefore: 'true' | 'false' | undefined;
  extensionElements: any;
}
