import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-uploads',
  templateUrl: './profile-uploads.component.html',
  styleUrls: ['./profile-uploads.component.scss']
})
export class ProfileUploadsComponent {
  public readonly uploads: {name: string; type: string;}[] = [
    {
      name: 'SandersP.pdf',
      type: 'pdf',
    },
    {
      name: 'SandersP.pdf',
      type: 'pdf',
    },
  ];
}
