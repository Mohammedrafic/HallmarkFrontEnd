import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss']
})
export class CandidateProfileComponent implements OnInit {
  public photo: Blob | null = null;
  public readonlyMode = false;
  private filesDetails: Blob[] = [];
  private isRemoveLogo: boolean;

  constructor() {
  }

  ngOnInit(): void {
  }

  public onImageSelect(event: Blob | null) {
    if (event) {
      this.filesDetails = [event as Blob];
      this.isRemoveLogo = false;
    } else {
      this.filesDetails = [];
      this.isRemoveLogo = true;
    }
  }
}
