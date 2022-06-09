import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNextPreviousComponent } from './dialog-next-previous.component';

describe('DialogNextPreviousComponent', () => {
  let component: DialogNextPreviousComponent;
  let fixture: ComponentFixture<DialogNextPreviousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNextPreviousComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNextPreviousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
