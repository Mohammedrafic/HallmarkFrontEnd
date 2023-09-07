import { IteratorHelper } from './iterator.interface';

export class HelpIterator implements IteratorHelper<string> {
  private position = -1;

  private collection: string[];

  private reverse: boolean;

  constructor(public items: string[], public reverseIteration = false) {
    this.reverse = reverseIteration;
    this.collection = this.reverse ? items.reverse() : items;
  }

  hasNext(): boolean {
    return !!this.collection[this.position + 1];
  }

  getNext(): string {
    this.position += 1;
    return this.collection[this.position];
  }

  getCurrent(): string {
    return this.collection[this.position];
  }

  rewind(): void {
    this.position = -1;
  }
}