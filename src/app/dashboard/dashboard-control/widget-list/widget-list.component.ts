import { SelectionSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

import {
  Component,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { WidgetTypeEnum } from '../../enums/widget-type.enum';
import { WidgetOptionModel } from '../../models/widget-option.model';
import lodashMap from 'lodash/fp/map';
import findIndex from 'lodash/fp/findIndex';
import { BehaviorSubject, Subject, takeUntil, filter, startWith, distinctUntilChanged, combineLatest } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import { WidgetToggleModel } from '../../models/widget-toggle.model';
import type { GridRowSelectEventModel, GridRowDeselectEventModel } from '@shared/models/grid-row-selection-event.model';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-widget-list',
  templateUrl: './widget-list.component.html',
  styleUrls: ['./widget-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetListComponent extends DestroyableDirective implements OnChanges, OnInit {
  @Input() public isLoading: boolean | null;
  @Input() public selectedWidgets: WidgetTypeEnum[] | null;
  @Input() public widgets: WidgetOptionModel[];

  @Output() public closeDialogEmitter: EventEmitter<void> = new EventEmitter();
  @Output() public widgetToggleEmitter: EventEmitter<WidgetToggleModel> = new EventEmitter();

  @ViewChild('sideDialog', { static: true }) public sideDialog: DialogComponent;
  @ViewChild('gridComponent', { static: false }) public gridComponent: GridComponent;

  public readonly selectionSettings: SelectionSettingsModel = {
    type: 'Multiple',
    enableSimpleMultiRowSelection: true,
  };
  public readonly targetElement: HTMLElement = document.body;

  private readonly dataBoundTrigger$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly widgetDataChange$: Subject<void> = new Subject();

  public constructor(private readonly asction$: Actions) {
    super();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    (changes['selectedWidgets'] || changes['widgets']) && this.handleSelectedWidgets();
  }

  public ngOnInit(): void {
    this.initDataChangesStream();
    this.openDialog();
  }

  public dataBoundHandler(): void {
    this.dataBoundTrigger$.next(true);
  }

  public rowSelectedHandler(event: GridRowSelectEventModel<WidgetOptionModel>): void {
    event.isInteracted && this.widgetToggleEmitter.emit({ widget: event.data, isSelected: true });
  }

  public rowDeselectedHandler(event: GridRowDeselectEventModel<WidgetOptionModel>): void {
    event.isInteracted && this.widgetToggleEmitter.emit({ widget: event.data, isSelected: false });
  }

  private handleSelectedWidgets(): void {
    this.widgetDataChange$.next();
  }

  private initDataChangesStream(): void {
    combineLatest([this.widgetDataChange$.pipe(startWith(null)), this.dataBoundTrigger$])
      .pipe(
        filter(([, dataBound]: [unknown, boolean]) => dataBound),
        distinctUntilChanged((previous, current) => isEqual(previous, current)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.handleDataChange();
      });
  }

  private handleDataChange(): void {
    const selectedWidgetIndexes = lodashMap(
      (selectedWidget: WidgetTypeEnum) =>
        findIndex((widget: WidgetOptionModel) => widget.id === selectedWidget, this.widgets),
      this.selectedWidgets
    );

    this.gridComponent.selectRows(selectedWidgetIndexes);
  }

  private openDialog(): void {
    this.asction$.pipe(takeUntil(this.destroy$), ofActionSuccessful(ShowSideDialog)).subscribe((data) => {
      if (data) {
        this.sideDialog.show();
      }
    });
  }
}
