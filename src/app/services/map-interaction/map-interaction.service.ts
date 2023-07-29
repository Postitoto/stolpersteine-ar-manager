import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Coordinates } from 'src/app/models/coordinates';

@Injectable({
  providedIn: 'root'
})
export class MapInteractionService {

  private coordinates$: Subject<Coordinates>;
  private newMarker$: Subject<any>;
  private removeMarker$: Subject<number>;

  constructor() {
    this.coordinates$ = new Subject<Coordinates>();
    this.newMarker$ = new Subject<any>();
    this.removeMarker$ = new Subject<number>();
  }

  changeCoordinates(coordinates: Coordinates) {
    this.coordinates$.next(coordinates);
  }

  getCoordinates() {
    return this.coordinates$;
  }

  addMapMarker(lon: number, lat: number) {
    this.newMarker$.next({lon, lat});
  }

  getMapMarker() {
    return this.newMarker$;
  }

  removeMapMarker(index: number) {
    console.log("removed a marker");
    this.removeMarker$.next(index);
  }

  getRemoveMapMarker() {
    return this.removeMarker$;
  }
}
