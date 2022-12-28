import { PageOfCollections } from "@shared/models/page.model";

export type MasterCommitment = {
  id?: number;
  name: string;
}

export type MasterCommitmentsPage = PageOfCollections<MasterCommitment>;
