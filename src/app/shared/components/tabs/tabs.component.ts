import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { TabsModel } from '@shared/components/tabs/tabs.model';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';
import { SelectEventArgs } from '@syncfusion/ej2-navigations/src/tab/tab';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent<T> implements AfterViewInit {
  @ViewChildren('tabContent', { read: ViewContainerRef }) public dynamic: QueryList<ViewContainerRef>;

  @ViewChild('tabComponent', { read: TabComponent }) public tabComponent: TabComponent;

  @Input() public tabs: TabsModel<T>[];

  @Output() public selectEmitter: EventEmitter<SelectEventArgs> = new EventEmitter<SelectEventArgs>();
  @Output() public createdEmitter: EventEmitter<Event> = new EventEmitter<Event>();

  private componentRef: ComponentRef<T>;

  public ngAfterViewInit() {
    this.loadComponent();
  }

  public onCreated(event: Event): void {
    this.initDisabledState();
    this.createdEmitter.emit(event);
  }

  public onSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  private loadComponent(): void {
    this.dynamic.map((vcr: ViewContainerRef, i: number) => {
      if (this.tabs[i].component) {
        vcr.clear();
        this.componentRef = vcr.createComponent(this.tabs[i].component!);
      }
    });
  }

  private initDisabledState(): void {
    this.tabs.forEach((tab, index: number) => {
      this.tabComponent.enableTab(index, !tab.disabled);
    });
  }
}
