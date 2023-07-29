import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppConfig, ConfigData } from './util-config/app-config';
import { Logger } from './util-config/logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'stolpersteine-manager';
  tabTitle = 'Stolpersteine Manager'
  loaded = false;

  constructor(private http: HttpClient, private titleService: Title) {
    this.titleService.setTitle(this.tabTitle);
  }

  ngOnInit(): void {
    this.loadConfigData();
  }

  async loadConfigData() {
    const configData = await this.http.get('assets/config.json').toPromise();
    Logger.consoleLog(configData);
    AppConfig.setConfig(configData as ConfigData);
    this.loaded = true;
  }
}
