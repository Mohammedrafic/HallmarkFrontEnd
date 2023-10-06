import { DialogNextPreviousOption } from "@shared/components/dialog-next-previous/dialog-next-previous.component";
import { OrderCandidatesList } from "@shared/models/order-management.model";

export const getDialogNextPreviousOption = 
    (selectedOrder: OrderCandidatesList, gridData: OrderCandidatesList[]): DialogNextPreviousOption => {
        const [first] = gridData;
        const last = gridData[gridData.length - 1];
        return {
        previous: first.candidateId !== selectedOrder.candidateId,
        next: last.candidateId !== selectedOrder.candidateId,
        };
    };
