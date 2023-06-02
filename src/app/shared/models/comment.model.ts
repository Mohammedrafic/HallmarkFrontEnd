export class Comment {
  id: number;
  text: string;
  isExternal: boolean;
  commentContainerId: number;
  createdAt: Date;
  firstName: string;
  lastName: string;
  new?: boolean;
  isRead?: boolean;
  isPrivate? : boolean;
}
  