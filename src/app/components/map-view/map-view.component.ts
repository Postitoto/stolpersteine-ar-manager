import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { Coordinates } from 'src/app/models/coordinates';
import { Feature, MapBrowserEvent, Overlay } from 'ol';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Icon } from 'ol/style';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';
import * as OlControls from 'ol/control';
import { DataService } from 'src/app/services/data/data.service';
import { StolpersteinLocation } from 'src/app/models/stolpersteinLocation';
import { Router } from '@angular/router';
import { AppUtils } from 'src/app/util-config/app-utils';
import { ConfirmationComponent } from '../dialogs/confirmation/confirmation.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit{
  @Input() locationCoordinates?: Coordinates[];
  @Output() coordinateEmitter;
  map: Map | undefined;
  isValidEmit = true;
  selectedLocation?: StolpersteinLocation;
  selectedIndex?: number;
  private informationOverlay?: Overlay;
  private infoHTMLElement?: HTMLElement;
  
  constructor(private mapInteraction: MapInteractionService,
              private dataService: DataService,
              private router: Router,
              private dialog: MatDialog,
              private snackbar: MatSnackBar) { 
    this.coordinateEmitter = new EventEmitter<Coordinates>();
  }

  ngOnInit(): void {
    this.infoHTMLElement = document.getElementById("informationOverlay") as HTMLElement;
    this.infoHTMLElement.style.display = 'none';
    this.map = new Map({
      target: 'stolpersteine_map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: olProj.fromLonLat([11.575496, 48.137347]),
        zoom: 10
      }),
      controls: [new OlControls.Zoom]
    });
    this.locationCoordinates?.forEach(coords => {
      this.drawMarker(Number.parseFloat(coords.longitude), Number.parseFloat(coords.latitude));
    });
    this.map.on(['pointerdrag'], () => this.cancelEmit());
    this.mapInteraction.getMapMarker().subscribe(data => {
      this.drawMarker(data.lon, data.lat);
    });
    this.mapInteraction.getRemoveMapMarker().subscribe(index => {
      this.removeMarker(index);
    });
    this.changeInteraction();
  }

  getCoordinates(event: any) {
    const coordinates = this.map?.getEventCoordinate(event);
    if (coordinates && this.isValidEmit) {
      const projCoordinates = olProj.toLonLat(coordinates);
      const coords = {latitude: projCoordinates[1].toString() , longitude: projCoordinates[0].toString()} as Coordinates;
      this.coordinateEmitter.emit(coords);
      this.mapInteraction.changeCoordinates(coords);
    } else {
      this.isValidEmit = true;
    }   
  }

  cancelEmit() {
    this.isValidEmit = false;
  }

  setMapToFocus() { // TODO
    
  }

  private addMarker(marker: VectorLayer<any>) {
    if (this.map) {
      this.map.addLayer(marker);
    }
  }

  private drawMarker(lon: number, lat: number) {
    const position = olProj.fromLonLat([lon, lat]);
    const marker = new Feature({
      geometry: new Point(position),
      info: {coordinates: {latitude: lat.toString(), longitude: lon.toString()} as Coordinates}
    });
    marker.setStyle(new Style({
      image: new Icon({
        color: '#0000ff',
        crossOrigin: 'anonymous',
        src: 'assets/map/map_marker.svg',
        imgSize: [24, 24]
      })
    }));
    const vectorSource = new VectorSource({
      features: [marker]
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });
    
    this.addMarker(vectorLayer);
  }

  private removeMarker(index: number) {
    if (this.map) {
      const layers = this.map.getLayers();
      // add 1 because 0th layer is map itself
      this.map.removeLayer(layers.item(index + 1));
    }
  }
  private changeInteraction() {
    this.map?.on('click', (e) => this.clickMarkerHandler(e));
    this.map?.on('pointermove', (e) => this.cursorStyleHandler(e));
  }

  private clickMarkerHandler(event: MapBrowserEvent<any>) {
    const features = this.map?.getFeaturesAtPixel(event.pixel);
    if (!features!![0] && this.informationOverlay) {
      this.selectedLocation = undefined;
      this.selectedIndex = undefined;
      this.map?.removeOverlay(this.informationOverlay);
    }
    this.map?.forEachFeatureAtPixel(event.pixel, (feature) => {
      const coords = feature.get('info').coordinates;
      if (this.informationOverlay) {
        this.selectedLocation = undefined;
        this.selectedIndex = undefined;
        this.map?.removeOverlay(this.informationOverlay);
      }
      this.dataService.getLocations().subscribe(locations => {
        this.selectedLocation = locations.find(loc => loc.coordinates.latitude == coords.latitude && loc.coordinates.longitude == coords.longitude);
        this.selectedIndex = locations.findIndex(loc => loc === this.selectedLocation);
          this.informationOverlay = new Overlay({
            element: this.infoHTMLElement
          });
          this.informationOverlay.setPosition(feature.get('geometry').flatCoordinates);
          this.map?.addOverlay(this.informationOverlay);
          this.infoHTMLElement?.style.setProperty('display', 'block');
      });
    }, {hitTolerance: 2});
  }

  private cursorStyleHandler(event: MapBrowserEvent<any>) {
    if (this.map) {
      const feature = this.map.getFeaturesAtPixel(event.pixel, {hitTolerance: 2})[0];
      if (feature) {
        event.map.getTargetElement().style.cursor = 'pointer';
      } else {
        event.map.getTargetElement().style.cursor = 'default';
      }
    } 
  }

  openLocationDetails(location: StolpersteinLocation | undefined) {
    if (!location) {
      return;
    } else {
      this.router.navigateByUrl(`/locations/${AppUtils.coordinatesToString(location.coordinates)}`);
    }
  }

  deleteLocation(location: StolpersteinLocation | undefined) {
    if(location) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        data: {itemName: 'location', itemDescription: location.name}
      });
      dialogRef.afterClosed().subscribe((closeData) => {
        if (closeData) {
          this.dataService.deleteLocation(location.coordinates).subscribe(() => {
            if(this.selectedIndex && this.selectedIndex !== -1){
              this.mapInteraction.removeMapMarker(this.selectedIndex);
            }
            this.snackbar.open('Deleted location: '+location.name, 'Close', {duration: 4000});
          }, error => console.error(error));
        }
        return;
      });
    }

     // Close the overlay
     if(this.informationOverlay){
      this.map?.removeOverlay(this.informationOverlay);
    }
  }
}
