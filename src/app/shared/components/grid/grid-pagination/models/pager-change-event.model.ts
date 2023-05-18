export interface PagerChangeEventModel {
  currentPage: number;
  newProp: Prop;
  oldProp: Prop;
  cancel: boolean;
  name: 'click';
}

interface Prop {
  currentPage: number;
  totalRecordsCount?: number;
}
