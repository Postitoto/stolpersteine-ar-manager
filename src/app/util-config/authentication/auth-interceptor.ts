import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthenticationService } from "src/app/services/authentication/authentication.service";
import { AppConfig } from "../app-config";
import { Logger } from "../logger";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler) {
        const userCredentials = this.authService.getUserCredentials();
        if (userCredentials) {
            request = request.clone({
                headers: request.headers.set('Authorization', userCredentials)
            });
            Logger.consoleLog(request);
        }
        return next.handle(request);
    }
}