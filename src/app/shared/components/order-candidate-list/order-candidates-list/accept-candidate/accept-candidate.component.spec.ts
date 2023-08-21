import { UpdateAgencyCandidateJob } from "@agency/store/order-management.actions";
import { TestBed } from "@angular/core/testing";
import { Store } from "@ngxs/store";

describe('AcceptCandidateComponent', () => {
    let storeSpy: jasmine.SpyObj<Store>;
  
    beforeEach(() => {
      storeSpy = jasmine.createSpyObj(['dispatch']);
  
      TestBed.configureTestingModule({
        providers: []
      });
    })
  
    it('should dispatch Logout and Reset actions', () => {
      storeSpy.dispatch.withArgs([
        jasmine.any(UpdateAgencyCandidateJob)
      ])
       .and
       .callFake(([updateAgencyCandidateJobAction]) => {
        console.log(updateAgencyCandidateJobAction);
         //expect(updateAgencyCandidateJobAction.payload).toEqual({...something});
      });
    })
  });