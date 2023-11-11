import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Tour } from 'src/app/models/tour';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-tour-list',
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.scss']
})
export class TourListComponent implements OnInit {

  tours: Tour[] = []

  constructor(private data: DataService, private router: Router) { }

  ngOnInit(): void {
    this.data.getAllTours().subscribe(tours => this.tours = tours);
  }

  navigateToDetailView(tour: Tour) { 
    this.router.navigateByUrl(`tours/${tour.id}`);
  }
}
