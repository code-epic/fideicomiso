import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader'


@Component({
  selector: 'app-afiliados',
  templateUrl: './afiliados.component.html',
  styleUrls: ['./afiliados.component.scss']
})
export class AfiliadosComponent implements OnInit {

  constructor(
    private ngxService: NgxUiLoaderService,

  ) { }

  ngOnInit(): void {
  }
}
