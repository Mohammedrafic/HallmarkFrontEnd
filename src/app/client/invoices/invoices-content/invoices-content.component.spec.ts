import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesContentComponent } from './invoices-content.component';

describe('InvoicesContentComponent', () => {
  let component: InvoicesContentComponent;
  let fixture: ComponentFixture<InvoicesContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
