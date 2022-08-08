import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Comment } from '@shared/models/comment.model';
import { SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';

enum CommentsFilter {
  All = 'All',
  Internal = 'Internal',
  External = 'External',
}

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsComponent {
  @Input() useBackground: boolean = true;
  @Input() comments: Comment[] = [];

  @Output() onCommentAdded = new EventEmitter<Comment>();

  @ViewChild('textBox')
  public textBox: TextBoxComponent;

  @ViewChild('body')
  public body: ElementRef;

  private unsubscribe$: Subject<void> = new Subject();

  public selectedFilter = CommentsFilter.All;
  public showExternal = false;
  public commentsFilterItems = [ CommentsFilter.All, CommentsFilter.Internal, CommentsFilter.External ];
  public commentsFilter = CommentsFilter;
  public isExternal = false;
  public message: string;
  public scroll$ = new Subject<void>();

  constructor() {
    this.scroll$.pipe(takeUntil(this.unsubscribe$), debounceTime(300)).subscribe(() => {
      this.scrollToLastMessage();
    });
  }

  ngAfterViewInit (): void {
    this.scrollToLastMessage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private scrollToLastMessage(): void {
    this.body?.nativeElement.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
  }

  public textBoxInit(): void {
    this.textBox.addAttributes({ rows: '2' });
  }

  public visibilityHandler(): void {
    this.isExternal = !this.isExternal;
  }

  public send(): void {
    if (this.message) {
      this.comments.push({
        id: 0, text: this.message, creationDate: new Date(), isExternal: this.isExternal, new: true
      });
      this.message = '';
      this.scroll$.next();
    }
  }

  public onFilterChange(event: SelectEventArgs): void {
    this.showExternal = event.itemData.value === CommentsFilter.External;
    this.scroll$.next();
  }
}
