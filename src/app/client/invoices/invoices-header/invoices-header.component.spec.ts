import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesHeaderComponent } from './invoices-header.component';

describe('InvoicesHeaderComponent', () => {
  let component: InvoicesHeaderComponent;
  let fixture: ComponentFixture<InvoicesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
