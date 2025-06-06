import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DialogData } from 'src/app/pages/generico/perfil/perfil.component';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Contrato } from 'src/app/services/banfanb/contrato.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-estadocuenta',
  templateUrl: './estadocuenta.component.html',
  styleUrls: ['./estadocuenta.component.scss']
})
export class EstadocuentaComponent implements OnInit {
  dataSource: any 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['fecha_operacion', 'debe', 'haber', 'descripcion'];

  Contrato: Contrato

  constructor(
    public dialogRef: MatDialogRef<EstadocuentaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {contrato: Contrato},
    private _apiService: ApiService) {
      this.Contrato = data.contrato
      console.log(this.Contrato)
  }

  ngOnInit(): void {
    this.consultarEstadoCuenta()
  }

  consultarEstadoCuenta(){
    let xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_ESTADO_CUENTA,
      parametros: this.Contrato.numero
    }

    this._apiService.Ejecutar(xAPI).subscribe({
      next: (data) =>{
        console.log(data)
        this.dataSource = new MatTableDataSource<any>(data.Cuerpo)
        this.dataSource.paginator = this.paginator;
        console.log(this.dataSource)
      },
      error: (err) => {
        console.error(err)
      }
    })
  }

}
