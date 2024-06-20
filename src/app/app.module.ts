import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HmPipe } from './hm.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HebWeekPipe } from './hebWeek.pipe';

@NgModule({ declarations: [AppComponent, HmPipe, HebWeekPipe],
    bootstrap: [AppComponent], imports: [BrowserModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the app is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000',
        })], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}
