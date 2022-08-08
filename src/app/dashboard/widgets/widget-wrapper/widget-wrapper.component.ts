import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-widget-wrapper',
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetWrapperComponent {
  @Input() public isLoading: boolean;
  @Input() public title: string;

  @ContentChild('header') public readonly header: TemplateRef<HTMLElement>;
  @ContentChild('chart') public readonly chart: TemplateRef<HTMLElement>;
  @ContentChild('lineChart') public readonly lineChart: TemplateRef<HTMLElement>;
  @ContentChild('mapChart') public readonly mapChart: TemplateRef<HTMLElement>;
  @ContentChild('positionChat') public readonly positionChart: TemplateRef<HTMLElement>;
  @ContentChild('legend') public readonly legend: TemplateRef<HTMLElement>;
}
