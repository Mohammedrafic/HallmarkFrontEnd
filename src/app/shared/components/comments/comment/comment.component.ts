import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommentsFilter } from '@core/enums/common.enum';
import { Comment } from '@shared/models/comment.model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent extends Destroyable {
  @Input() comment: Comment;
  @Input() scrolledToMessage$: Subject<void>;
  @Input() commentType: string | undefined;
  @Output() onCommentAdded = new EventEmitter<Comment>();
  @Output() onRead = new EventEmitter<Comment>();
  public ExternalIcon:boolean = false;
  public InternalIcon:boolean = false;

  @ViewChild('message')
  public messageRef: ElementRef;

  private unreadObserverSubscription: Subscription;

  constructor(private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    if (!this.comment.isRead) {
      this.unreadObserverSubscription = this.scrolledToMessage$.pipe(
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.isScrolledIntoView();
      });
    }
    if (this.comment.new) {
      setTimeout(() => {
        this.comment.new = false;
        this.onCommentAdded.emit(this.comment);
        this.cd.detectChanges();
      }, 500);
    }
  }

  ngOnChanges():void {
    this.watchForCommentTypes();
  }

  private watchForCommentTypes() : void{
    if(this.comment.isExternal === true){
      this.commentType === CommentsFilter.All ? (this.comment.isPrivate === false ? this.ExternalIcon = true : this.ExternalIcon = false) : this.commentType === CommentsFilter.External ? this.ExternalIcon = true : this.ExternalIcon = false;
    } else if(this.comment.isExternal === false) {
      this.InternalIcon = true
    }
    this.cd.markForCheck();
  }

  ngAfterViewInit(): void {
    if (!this.comment.isRead) {
      this.isScrolledIntoView();
    }
  }

  private isScrolledIntoView(): void {
    if (this.messageRef) {
      const container = this.messageRef.nativeElement.parentElement.parentElement;
      if (!container) {
        return;
      }
      const rect = this.messageRef.nativeElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const isVisible = (rect.top >= containerRect.top) && (rect.bottom <= containerRect.bottom);

      if (isVisible) {
        this.comment.isRead = true;
        this.onRead.emit(this.comment);
        this.unreadObserverSubscription.unsubscribe();
        this.cd.detectChanges();
      }
    }
  }
}
