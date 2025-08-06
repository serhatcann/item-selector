import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemSelector } from '@/app/features/item-selector/item-selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ItemSelector],
  templateUrl: './app.html',
})
export class App {}
