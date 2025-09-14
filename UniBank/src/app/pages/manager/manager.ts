import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './manager.html',
  styleUrls: ['./manager.css']
})
export class Manager {}
