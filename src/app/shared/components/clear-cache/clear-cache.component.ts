import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clear-cache',
  templateUrl: './clear-cache.component.html',
})
export class ClearCacheComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

}
