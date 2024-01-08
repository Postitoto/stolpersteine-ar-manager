import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Coordinates } from 'src/app/models/coordinates';
import { Stolperstein } from 'src/app/models/stolperstein';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { DataService } from 'src/app/services/data/data.service';
import { AppUtils } from 'src/app/util-config/app-utils';
import { Logger } from 'src/app/util-config/logger';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-stolpersteine',
  templateUrl: './stolpersteine.component.html',
  styleUrls: ['./stolpersteine.component.scss']
})
export class StolpersteineComponent implements OnInit, OnDestroy {

  stolpersteinLocation?: StolpersteinLocation;
  existingStolperstein?: Stolperstein;
  loaded = false;
  destroy = new Subject<void>();

  constructor(private activatedRoute: ActivatedRoute,
              private dataService: DataService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    const locationId = this.activatedRoute.snapshot.paramMap.get('loc-id');
    const stolpersteinId = this.activatedRoute.snapshot.paramMap.get('stein-id');
    const coordinates = this.activatedRoute.snapshot.paramMap.get('coordinates');
    let loadedFirst = false;
    if (locationId) {
      this.dataService.getLocations()
      .pipe(takeUntil(this.destroy))
      .subscribe(locations => {
        const foundLoc = locations.find(loc => loc.id.toString() === locationId);
        if (foundLoc) {
          this.stolpersteinLocation = foundLoc;
          this.loaded = true;
        }    
      });
    }
    if (stolpersteinId && coordinates) {
      this.dataService.getLocations()
      .pipe(takeUntil(this.destroy))
      .subscribe(locations => {
        const foundLoc = locations.find(loc => AppUtils.coordinatesToString(loc.coordinates) === coordinates);
        if (foundLoc)
          this.stolpersteinLocation = foundLoc;
          if (loadedFirst)
            this.loaded = true;
          else
            loadedFirst = true;
      });
      this.dataService.getStolpersteineByLocation(coordinates).subscribe(stolpersteine => {
        Logger.consoleLog("Fetched Stolpersteine: ", stolpersteine);
        const foundStein = stolpersteine.find(stein => stein.id.toString() === stolpersteinId);
        if (foundStein) {
          this.existingStolperstein = foundStein;
          if (loadedFirst)
            this.loaded = true;
          else
            loadedFirst = true;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  navigateBack() {
    // Reworked this so it works again
    if(this.stolpersteinLocation?.coordinates){
      const lat = this.stolpersteinLocation?.coordinates.latitude;
      const lon = this.stolpersteinLocation?.coordinates.longitude;
      this.router.navigateByUrl(`/locations/${lat},${lon}`);
      //this.router.navigateByUrl(`/locations/${this.route.snapshot.paramMap.get("coordinates")}`);
    }
    else{
      this.router.navigateByUrl(`/locations/list`);
    }
  }
}
