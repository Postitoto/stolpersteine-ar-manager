import { environment } from "src/environments/environment";

export class Logger {


    public static consoleLog(msg?: any, ...optionalMsg: any[]) {
        if(!environment.production) {
            console.log(msg, ...optionalMsg);
        }
    }
}