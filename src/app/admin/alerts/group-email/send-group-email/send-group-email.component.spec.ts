import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendGroupEmailComponent } from './send-group-email.component';

describe('SendGroupEmailComponent', () => {
  let component: SendGroupEmailComponent;
  let fixture: ComponentFixture<SendGroupEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendGroupEmailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendGroupEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
