import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Coordinates } from 'src/app/models/coordinates';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { AppUtils } from 'src/app/util-config/app-utils';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {

  locations: StolpersteinLocation[] = [];

  constructor(private data: DataService, private router: Router) { }

  ngOnInit(): void {
    this.data.getLocations().subscribe(locs => {
      this.locations = locs;
    })
    
  }

  navigateToDetailView(coordinates: Coordinates) {
    this.router.navigateByUrl(`locations/${AppUtils.coordinatesToString(coordinates)}`);
  }
}
