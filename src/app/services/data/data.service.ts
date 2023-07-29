import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Coordinates } from 'src/app/models/coordinates';
import { Stolperstein } from 'src/app/models/stolperstein';

import { StolpersteinLocation, StolpersteinLocationTransfer } from 'src/app/models/stolpersteinLocation';
import { AppConfig } from 'src/app/util-config/app-config';
import { AppUtils } from 'src/app/util-config/app-utils';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient,
              private auth: AuthenticationService) { }

  getLocations(): Observable<StolpersteinLocation[]> {
    return this.http.get<StolpersteinLocationTransfer[]>(`${AppConfig.getBackendUrl()}/api/get-locations/`).pipe(
      /** Converts the transfered json data to the better accessable StolpersteinLocation model */ 
      map((locations: StolpersteinLocationTransfer[]) => {
        return locations.map(location => {
          const coordDelimitered = location.coordinates.split(',');
          return {
            id: location.id,
            coordinates: {latitude: coordDelimitered[0], longitude: coordDelimitered[1]},
            name: location.name
          } as StolpersteinLocation
        })
      })
    );
  }

  getAllStolpersteine() {
    return this.http.get<Stolperstein[]>(`${AppConfig.getBackendUrl()}/api/stolpersteine/`) as Observable<Stolperstein[]>;
  }

  getStolpersteineByLocation(coordinates: Coordinates | string) {
    let coords = coordinates;
    if (this.coordTypeGuard(coordinates)) {
      coords = AppUtils.coordinatesToString(coordinates);
    } 
    return this.http.get<Stolperstein[]>(`${AppConfig.getBackendUrl()}/api/get-stolpersteine/${coords}`) as Observable<Stolperstein[]>
  }

  getStolpersteinById(id: number) {
    return this.http.get<Stolperstein>(`${AppConfig.getBackendUrl()}/api/stolpersteine/${id}`) as Observable<Stolperstein>;
  }

  addLocation(requestBody: StolpersteinLocationTransfer) {
    return this.http.post(`${AppConfig.getBackendUrl()}/api/add-location/`, requestBody);
  }

  deleteLocation(coordinates: Coordinates | string) {
    let coords = coordinates;
    if (this.coordTypeGuard(coordinates)) {
      coords = AppUtils.coordinatesToString(coordinates);
    } 
    return this.http.delete(`${AppConfig.getBackendUrl()}/api/delete-location/${coords}`);
  }

  addOrUpdateStolperstein(newOrUpdatedStolperstein: any, coordinates: Coordinates | string) {
    let coords = coordinates;
    if (this.coordTypeGuard(coordinates)) {
      coords = AppUtils.coordinatesToString(coordinates);
    }
    return this.http.post(`${AppConfig.getBackendUrl()}/api/add-stolperstein/${coords}`, newOrUpdatedStolperstein)
  }

  uploadStolpersteinAssets(stolpersteinId: number, assets: any) {
    return this.http.post(`${AppConfig.getBackendUrl()}/api/assets/${stolpersteinId}`, assets);
  }

  deleteStolperstein(coordinates: Coordinates | string, steinId: string) {
    const coords = this.safeCoordinatesAsString(coordinates);
    return this.http.delete(`${AppConfig.getBackendUrl()}/api/delete-stolperstein/${coords}/${steinId}`);
  }

  deleteRelation(coordinates: Coordinates | string, id: number) {
    const coords = this.safeCoordinatesAsString(coordinates);
    return this.http.delete(`${AppConfig.getBackendUrl()}/api/relation/delete/${coords}/${id}`);
  }

  deleteLifeStation(coordinates: Coordinates | string, id: number) {
    const coords = this.safeCoordinatesAsString(coordinates);
    return this.http.delete(`${AppConfig.getBackendUrl()}/api/lifestation/delete/${coords}/${id}`) as Observable<Response>;
  }

  deleteTextbox(coordinates: Coordinates | string, id: number) {
    const coords = this.safeCoordinatesAsString(coordinates);
    return this.http.delete(`${AppConfig.getBackendUrl()}/api/textbox/delete/${coords}/${id}`);
  }

  updateOrder(coordinates: Coordinates | string, requestBody: any) {
    const coords = this.safeCoordinatesAsString(coordinates);
    return this.http.post(`${AppConfig.getBackendUrl()}/api/order/${coords}`, requestBody);
  }

  private setCredentials(): HttpHeaders {
    return new HttpHeaders().set('Authorization', this.auth.getUserCredentials()!);
  }

  private coordTypeGuard(coordinates: any): coordinates is Coordinates {
    if ((coordinates as Coordinates).latitude) {
      return true;
    }
    return false;
  }

  private safeCoordinatesAsString(coordinates: Coordinates | string): string {
    let coords = coordinates;
    if (this.coordTypeGuard(coordinates)) {
      coords = AppUtils.coordinatesToString(coordinates);
    }
    return coords as string;
  }
}
