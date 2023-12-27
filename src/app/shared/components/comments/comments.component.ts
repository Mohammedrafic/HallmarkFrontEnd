import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { Comment } from '@shared/models/comment.model';
import { UserState } from 'src/app/store/user.state';
import {
  MarkCommentAsRead,
  SaveComment,
  SaveCommentSuccess,
  UpdateGridCommentsCounter,
} from './store/comments.actions';
import { BusinessUnit } from '@shared/models/business-unit.model';

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
  @Input() useStyle = false;
  @Input() disabled = false;
  @Input() orderId: number;
  public commentData: Comment[] = [];
  public searchcommentData: Comment[] = [];
  @Output() commentSaveCheck = new EventEmitter<boolean>();
  @Input() set comments(value: Comment[]) {
    if (value?.length) {
      this.commentsList = value;
      this.commentData = value.filter((comments) => !comments.isPrivate);
      this.searchcommentData = this.commentData;
      this.hasUnreadMessages = this.hasUnread();
      this.initView$.next();
    } else {
      this.commentsList = [];
      this.commentData = [];
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
  @Output() saveCommentsEvent = new EventEmitter<Comment[]>();

  @ViewChild('textBox')
  public textBox: TextBoxComponent;

  @ViewChild('body')
  public body: ElementRef;

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

  constructor(private store: Store, private router: Router, private cd: ChangeDetectorRef, private actions$: Actions) {
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
    this.isAgencyUser = this.router.url.includes('agency');
    if (this.isAgencyUser || this.CommentConfiguration === true) {
      this.isExternal = true;
    }
    this.actions$
      .pipe(ofActionSuccessful(SaveCommentSuccess), takeUntil(this.unsubscribe$))
      .subscribe(() => this.commentSaveCheck.emit(true));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onKeyUpEvent(event: KeyboardEvent){
    const searchValue = (event.target as HTMLInputElement).value;
    let users = searchValue == '' ? this.searchcommentData : this.searchcommentData.filter(function(user){
      return (user.text.toString().toLowerCase().indexOf(searchValue.toLowerCase()) > -1 ||
      new Date(user.createdAt).toLocaleDateString().indexOf(searchValue.toLowerCase()) > -1
      ) ||
      (user.firstName.toLowerCase() +" "+ user.lastName.toLowerCase()).indexOf(searchValue.toLowerCase()) > -1
    }); 
    this.commentData = users; 
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
      bussinessUnitType: user.businessUnitType == 3 ? "Organization" : user.businessUnitType == 4 ? "Agency" : user.businessUnitType == 2 ? "MSP" : "Hallmark"
    };
    this.comments.push(comment);
    this.commentData.unshift(comment);
    this.message = '';
    this.scroll$.next(null);
    if (!this.isCreating) {
      this.store.dispatch(new SaveComment(comment));
    }
    else{
      this.saveCommentsEvent.emit(this.comments);
    }
  }

  public onFilterChange(event: SelectEventArgs): void {
    this.commentData = this.commentsList;
    event.itemData.value === CommentsFilter.External
      ? (this.commentData = this.commentData.filter(
          (comments) => comments.isExternal === true && comments.isPrivate === false
        ))
      : this.commentData;
    event.itemData.value === CommentsFilter.Internal
      ? (this.commentData = this.commentData.filter(
          (comments) => comments.isExternal === false && comments.isPrivate === false
        ))
      : this.commentData;
    event.itemData.value === CommentsFilter.All
      ? (this.commentData = this.commentData.filter((comments) => comments.isPrivate === false))
      : this.commentData;
    this.searchcommentData = this.commentData;
    this.commentType = event.itemData.value;
    this.scroll$.next(null);
  }
}
