export interface PagerChangeEventModel {
  currentPage: number;
  newProp: { currentPage: number };
  oldProp: { currentPage: number };
  cancel: boolean;
  name: 'click';
}
