import { Component, OnInit } from '@angular/core';
import { Coordinates } from 'src/app/models/coordinates';
import { MapInteractionService } from 'src/app/services/map-interaction/map-interaction.service';

@Component({
  selector: 'app-map-popup',
  templateUrl: './map-popup.component.html',
  styleUrls: ['./map-popup.component.scss']
})
export class MapPopupComponent implements OnInit{

  coords: Coordinates;

  constructor(private mapInteraction: MapInteractionService) { 
    this.coords = {longitude: "0", latitude: "0"};
  }
  ngOnInit(): void {
    this.mapInteraction.getCoordinates().subscribe(coords => {
      this.coords = coords;
    });
  }
}
