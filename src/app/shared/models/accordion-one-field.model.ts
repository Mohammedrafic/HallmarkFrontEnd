import { AccordionClickArgs, ExpandEventArgs } from '@syncfusion/ej2-navigations';
import { AccordionComponent } from '@syncfusion/ej2-angular-navigations';

export class AccordionOneField {
  constructor(private accordionComponent: AccordionComponent) {}

  public clickedOnAccordion(e: AccordionClickArgs): HTMLElement | null {
    return (e.originalEvent!.target as Element).closest('.e-acrdn-header');
  }

  public toForbidExpandSecondRow(e: ExpandEventArgs, accorditionClickElement: HTMLElement | null): void {
    let expandCount: number = this.accordionComponent.element.querySelectorAll('.e-selected').length;
    let ele: Element = this.accordionComponent.element.querySelectorAll('.e-selected')[0];
    if (ele) {
      ele = ele.firstChild as Element;
    }
    if (expandCount === 1 && ele === accorditionClickElement) {
      e.cancel = true;
    }
  }
}
