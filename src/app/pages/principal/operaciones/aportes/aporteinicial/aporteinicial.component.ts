import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { LPosicionInversiones } from 'src/app/services/banfanb/contabilidad.service';

@Component({
  selector: 'app-aporteinicial',
  templateUrl: './aporteinicial.component.html',
  styleUrls: ['./aporteinicial.component.scss']
})
export class AporteinicialComponent implements OnInit {

  public lstAsientos = []
  public fechaultimo = ''
  public fechai: any
  public bcuentat : boolean = false
  public ELEMENT_DATA: LPosicionInversiones[] = [];
  displayedColumns: string[] = [
    "codigo",
    "instrumento",
    "valor_nominal",
    "costo_adquisicion",
    "interes_diario",
    "interes_acumulado",
  ];
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public acum_debe = 0
  public acum_haber = 0


  constructor() { }

  ngOnInit(): void {
    let d = new Date().toISOString().substring(0,10).split('-')
    this.fechaultimo = d[2] + '/' + d[1] + '/' + d[0]
  }



  Listar(){}

  Calcular(){}
}
