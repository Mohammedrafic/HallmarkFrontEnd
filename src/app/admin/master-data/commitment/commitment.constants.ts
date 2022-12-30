import { CommitmentGridActionRendererComponent } from "./grid-action-renderer/grid-action-renderer.component";
import { MasterCommitment } from "@shared/models/commitment.model";

export const CommitmentColumnsDefinition = ( editCallback: (data: MasterCommitment) => void ) => (
  [
    {
      headerName: '',
      width: 120,
      maxWidth: 120,
      sortable: true,
      cellRenderer: CommitmentGridActionRendererComponent,
      cellRendererParams: {
        edit: (data: MasterCommitment) => {
          editCallback(data);
        }
      }
    },
    {
      field: 'name',
      headerName: 'NAME',
      sortable: true,
    }
  ]
);
