import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

export interface ConfigData {
    backendUrl: string;
    backendUrlProd: string;
}

export class AppConfig {

    private static backendUrl = '';
    
    constructor(public http: HttpClient) {}

    static getBackendUrl() {
        return this.backendUrl;
    }

    static setConfig(configData: ConfigData) {
        if (environment.production) {
            this.backendUrl = configData.backendUrlProd;
        } else {
            this.backendUrl = configData.backendUrl;
        }  
    }
}