export interface IteratorHelper<T> {
  hasNext(): boolean;
  getNext(): T;
  getCurrent(): T;
  rewind(): void;
}
