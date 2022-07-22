import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeployCandidateMessageComponent } from './deploy-candidate-message.component';

describe('DeployCandidateMessageComponent', () => {
  let component: DeployCandidateMessageComponent;
  let fixture: ComponentFixture<DeployCandidateMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeployCandidateMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployCandidateMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
