import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Comment } from '@shared/models/comment.model';
import { Subject, Subscription } from 'rxjs';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-commentdata',
  templateUrl: './commentdata.component.html',
  styleUrls: ['./commentdata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentdataComponent {

  @Input() comment: Comment;
  @Input() scrolledToMessage$: Subject<void>;

  @Output() onCommentAdded = new EventEmitter<Comment>();
  @Output() onRead = new EventEmitter<Comment>();

  @ViewChild('message')
  public messageRef: ElementRef;
  public ExternalIcon:boolean = false;
  public InternalIcon:boolean = false;
  public PrivateIcon:boolean = false;
  
  private unreadObserverSubscription: Subscription;
  faUserFriends = faUserFriends as IconProp;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if(this.comment.isPrivate === true){
      this.PrivateIcon = true;
    } else if(this.comment.isExternal === false) {
      this.InternalIcon = true
    } else if(this.comment.isExternal === true){
      this.ExternalIcon = true;
    }
    if (!this.comment.isRead) {
      this.unreadObserverSubscription = this.scrolledToMessage$.subscribe(() => {
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
