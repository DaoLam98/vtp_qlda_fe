declare module 'bpmn-js/dist/bpmn-modeler.development.js';
declare module 'bpmn-js-properties-panel';
declare module 'camunda-bpmn-moddle/resources/camunda.json';

declare module 'bpmn-js/lib/Modeler' {

  class Modeler {
    constructor(options?: any);

    importXML(xml: string): Promise<{ warnings: Array<any> }>;

    saveXML(options?: any): Promise<{ xml: string }>;

    on(event: string, callback: Function): void;

    get(name: string): any;

    destroy(): void;
  }

  export = Modeler;
}

declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: any;
  export const BpmnPropertiesProviderModule: any;
  export const CamundaPlatformPropertiesProviderModule: any;
}

declare module 'camunda-bpmn-moddle/resources/camunda.json';
