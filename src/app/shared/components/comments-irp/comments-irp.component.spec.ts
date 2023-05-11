import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsIrpComponent } from './comments-irp.component';

describe('CommentsIrpComponent', () => {
  let component: CommentsIrpComponent;
  let fixture: ComponentFixture<CommentsIrpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentsIrpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsIrpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
