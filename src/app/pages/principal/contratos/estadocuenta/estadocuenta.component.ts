import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-estadocuenta',
  templateUrl: './estadocuenta.component.html',
  styleUrls: ['./estadocuenta.component.scss']
})
export class EstadocuentaComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EstadocuentaComponent>) { }

  ngOnInit(): void {
  }

}
