import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Comment } from '@shared/models/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentComponent {
  @Input() comment: Comment;

  @Output() onCommentAdded = new EventEmitter<Comment>();

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.comment.new) {
      setTimeout(() => {
        this.comment.new = false;
        this.onCommentAdded.emit(this.comment);
        this.cd.detectChanges();
      }, 500);
    }
  }
}
