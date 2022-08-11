import { Comment } from "@shared/models/comment.model";

export class SaveComment {
  static readonly type = '[Comments] Save Comment';
  constructor(public comment: Comment) {}
}

export class MarkCommentAsRead {
  static readonly type = '[Comments] Mark Comment As Read';
  constructor(public ids: number[]) {}
}
