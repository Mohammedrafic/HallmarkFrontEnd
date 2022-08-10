import { Comment } from "@shared/models/comment.model";

export class GetComments {
  static readonly type = '[Comments] Get Comments';
  constructor(public commentContainerId: number, public isExternal: boolean | null, public isAgency: boolean) {}
}

export class SaveComment {
  static readonly type = '[Comments] Save Comment';
  constructor(public comment: Comment) {}
}

export class MarkCommentAsRead {
  static readonly type = '[Comments] Mark Comment As Read';
  constructor(public ids: number[]) {}
}

export class ClearComments {
  static readonly type = '[Comments] Clear Comments';
  constructor() {}
}
