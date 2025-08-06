import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppCard } from './shared/components/app-card/app-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppCard],
  templateUrl: './app.html',
})
export class App {
}
