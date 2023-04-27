import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent implements OnInit {

  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public pagina: string = "BUSCADOR"

  ngOnInit() {
  }
}



//dataBase_uri= 'mongodb+srv://
//DevFeat:
// ZPCCapAFfr4upRXi@
// cluster0.oyi2v.mongodb.net/
// desarrollo-feat2021
// ?retryWrites=true&w=majority'
