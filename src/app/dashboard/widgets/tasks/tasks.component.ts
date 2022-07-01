import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ToggleSidebarState } from 'src/app/store/app.actions';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit, OnChanges {
  @Input() public tasks: any;
  url: string;

  constructor(private actions$: Actions, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.url = changes['tasks'].currentValue;
  }

  ngOnInit(): void {
    // temporary functionality to display  widget as an image to demo
    this.actions$.pipe(ofActionDispatched(ToggleSidebarState)).subscribe((isOpen) => {
      if (isOpen.payload) {
        setTimeout(() => {
          this.url = 'temporary-widget-tasks';
          this.cdr.markForCheck();
        }, 400);
        console.error(this.url);
      } else {
        setTimeout(() => {
          this.url = 'temporary-collapsed-widget-tasks';
          this.cdr.markForCheck();
        }, 400);
        console.error(this.url);
      }
    });
  }
}
