import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Comment } from '@shared/models/comment.model';
import { SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, filter, Observable, Subject, takeUntil, tap } from 'rxjs';
import { UserState } from 'src/app/store/user.state';
import { ClearComments, GetComments, MarkCommentAsRead, SaveComment } from './store/comments.actions';
import { CommentsState } from './store/comments.state';

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
  @Input() commentContainerId: number;
  @Input() isCreating: boolean = false;

  @ViewChild('textBox')
  public textBox: TextBoxComponent;

  @ViewChild('body')
  public body: ElementRef;

  @Select(CommentsState.comments)
  comments$: Observable<Comment[]>;

  private unsubscribe$: Subject<void> = new Subject();

  public selectedFilter = CommentsFilter.All;
  public showExternal = false;
  public commentsFilterItems = [ CommentsFilter.All, CommentsFilter.Internal, CommentsFilter.External ];
  public commentsFilter = CommentsFilter;
  public isExternal = false;
  public isAgencyUser = false;
  public message: string;
  public scroll$ = new Subject<HTMLElement | null>();
  public scrolledToMessage$ = new Subject<void>();
  public markAsRead$ = new Subject<number[]>();

  public readMessagesIds: number[] = []; 

  private hasUnreadMessages = false;

  constructor(private store: Store, private cd: ChangeDetectorRef) {
    this.scroll$.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe((messageEl: HTMLElement | null) => {
      if (messageEl) {
        this.scrollToSpecificMessage(messageEl);
      } else {
        this.scrollToLastMessage();
      }
    });
    this.markAsRead$.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe((ids: number[]) => {
      if (ids.length) {
        this.store.dispatch(new MarkCommentAsRead(this.readMessagesIds));
        this.readMessagesIds = [];
      }
    });
  }

  ngAfterViewInit (): void {
    if (!this.isCreating) {
      this.comments$.pipe(
        takeUntil(this.unsubscribe$), 
        filter((comments: Comment[]) => !!comments.length),
        tap((comments: Comment[]) => {
          this.comments = comments; /*[ // TODO: Mocked data, remove after BE
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet', isExternal: true, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: false, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment', isExternal: true, creationDate: new Date(), isRead: false,
            },
            {
              id: 0, text: '500 chars comment Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second linecomment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: false, creationDate: new Date(), isRead: false
            },
            {
              id: 0, text: 'short', isExternal: false, creationDate: new Date(), isRead: false,
            },
            {
              id: 0, text: 'Some Text', isExternal: true, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date(), isRead: true,
            },
            {
              id: 0, text: 'comment Lorem Ipsum Dolor Amet Comment Text Lorem Ipsum Dolor Amet Some Long Text goes to second line', isExternal: true, creationDate: new Date(), isRead: false
            },
          ]; */
          this.cd.detectChanges();
          return comments;
        })).subscribe((comments: Comment[]) => {
          this.hasUnreadMessages = this.hasUnread();
          const unreadMessages = this.body?.nativeElement.getElementsByClassName('new');
          if (unreadMessages.length) {
            this.scroll$.next(unreadMessages[0]);
          } else {
            this.scroll$.next(null);
          }
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.store.dispatch(new ClearComments());
  }

  private scrollToLastMessage(): void {
    this.body?.nativeElement.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
  }

  private scrollToSpecificMessage(messageEl: HTMLElement): void {
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
  }

  private hasUnread(): boolean {
    return !!this.comments.find((message: Comment) => !message.isRead);
  }

  public onRead(comment: Comment): void {
    this.readMessagesIds.push(comment.id);
    this.markAsRead$.next(this.readMessagesIds);
  }

  public onScroll(): void {
    if (this.hasUnreadMessages) {
      this.scrolledToMessage$.next();
      this.hasUnreadMessages = this.hasUnread();
    }
  }

  public textBoxInit(): void {
    this.textBox.addAttributes({ rows: '2' });
  }

  public visibilityHandler(): void {
    this.isExternal = !this.isExternal;
  }

  public send(): void {
    const comment = {
      id: 0, text: this.message, creationDate: new Date(), isExternal: this.isExternal, new: true, commentContainerId: this.commentContainerId, isRead: true
    };
    if (this.message) {
      this.comments.push(comment);
      this.message = '';
      this.scroll$.next(null);
    }
    if (!this.isCreating) {
      this.store.dispatch(new SaveComment(comment))
    } 
  }

  public onFilterChange(event: SelectEventArgs): void {
    this.showExternal = event.itemData.value === CommentsFilter.External;
    this.scroll$.next(null);
  }
}
