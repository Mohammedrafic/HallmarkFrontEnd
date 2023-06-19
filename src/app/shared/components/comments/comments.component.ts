import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Comment } from '@shared/models/comment.model';
import { SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { UserState } from 'src/app/store/user.state';
import { MarkCommentAsRead, SaveComment, UpdateGridCommentsCounter } from './store/comments.actions';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent {
  @Input() useBackground = true;
  @Input() disabled = false;
  @Input() orderId: number;
  public commentData: any;
  @Input() canVmsCreateOrders: boolean;
  @Input() set comments(value: Comment[]) {
    this.commentsList = value;
    if (value.length) {
      this.commentData = value.filter(comments => !comments.isPrivate);
      this.hasUnreadMessages = this.hasUnread();
      this.initView$.next();
    }
  }
  get comments(): Comment[] {
    return this.commentsList;
  }
  @Input() set externalCommentConfiguration(value: boolean | null | undefined) {
    this.CommentConfiguration = value;
    if (this.isAgencyUser || this.CommentConfiguration === true) {
      this.isExternal = true;
    }
  }
  get externalCommentConfiguration(): boolean | null | undefined {
    return this.CommentConfiguration;
  }

  public CommentConfiguration: boolean | null | undefined;
  public commentsList: Comment[] = [];
  @Input() commentContainerId: number;
  @Input() isCreating = false;

  @ViewChild('textBox')
  public textBox: TextBoxComponent;

  @ViewChild('body')
  public body: ElementRef;

  @Select(CommentsState.comments)
  comments$: Observable<Comment[]>;

  private unsubscribe$: Subject<void> = new Subject();

  public selectedFilter = CommentsFilter.All;
  public showExternal = false;
  public commentsFilterItems = [CommentsFilter.All, CommentsFilter.External, CommentsFilter.Internal];
  public commentsFilter = CommentsFilter;
  public isExternal = false;
  public isAgencyUser = false;
  public message: string;
  public scroll$ = new Subject<HTMLElement | null>();
  public scrolledToMessage$ = new Subject<void>();
  public markAsRead$ = new Subject<number[]>();
  public initView$ = new Subject<void>();
  public commentType: string | undefined;

  public readMessagesIds: number[] = [];

  private hasUnreadMessages = false;

  constructor(private store: Store, private cd: ChangeDetectorRef) {
    this.commentType = CommentsFilter.All;
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
        if (this.orderId) {
          this.store.dispatch(new UpdateGridCommentsCounter(this.readMessagesIds.length, this.orderId));
        }
        this.readMessagesIds = [];
      }
    });
    this.initView$.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe(() => {
      const unreadMessages = this.body?.nativeElement.getElementsByClassName('new');
      if (unreadMessages?.length) {
        this.scroll$.next(unreadMessages[0]);
      } else {
        this.scroll$.next(null);
      }
    });
    const user = this.store.selectSnapshot(UserState).user;
    this.isAgencyUser = user.businessUnitType === BusinessUnitType.Agency;
    if (this.isAgencyUser || this.CommentConfiguration === true) {
      this.isExternal = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private scrollToLastMessage(): void {
    this.body?.nativeElement.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }

  private scrollToSpecificMessage(messageEl: HTMLElement): void {
    messageEl.scrollIntoView({ block: 'nearest' });
  }

  private hasUnread(): boolean {
    return !!this.commentsList.find((message: Comment) => !message.isRead);
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
    if (this.isAgencyUser) {
      this.isExternal = true;
    } else {
      this.isExternal = !this.isExternal;
    }
  }

  public send(): void {
    if (!this.message) {
      return;
    }
    const user = this.store.selectSnapshot(UserState).user;
    const comment = {
      id: 0,
      text: this.message,
      createdAt: new Date(),
      firstName: user.firstName,
      lastName: user.lastName,
      isExternal: this.isExternal,
      new: true,
      commentContainerId: this.commentContainerId,
      isRead: true,
    };
    this.comments.push(comment);
    this.commentData.push(comment);
    this.message = '';
    this.scroll$.next(null);
    if (!this.isCreating) {
      this.store.dispatch(new SaveComment(comment));
    }
  }

  public onFilterChange(event: SelectEventArgs): void {
    this.commentData = this.commentsList;
    event.itemData.value === CommentsFilter.External ? this.commentData = this.commentData.filter((comments: { isExternal: boolean; isPrivate: boolean; }) => comments.isExternal === true && comments.isPrivate === false) : this.commentData;
    event.itemData.value === CommentsFilter.Internal ? this.commentData = this.commentData.filter((comments: { isExternal: boolean; isPrivate: boolean; }) => comments.isExternal === false && comments.isPrivate === false) : this.commentData;
    event.itemData.value === CommentsFilter.All ?  this.commentData = this.commentData.filter((comments: { isPrivate: boolean; }) => comments.isPrivate === false) : this.commentData;
    this.commentType = event.itemData.value;
    this.scroll$.next(null);
  }
}
