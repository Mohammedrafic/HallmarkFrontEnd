import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadCountComponent } from './head-count.component';

describe('HeadCountComponent', () => {
  let component: HeadCountComponent;
  let fixture: ComponentFixture<HeadCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeadCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
