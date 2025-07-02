import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
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
    private _apiService: ApiService,
    private ngxService: NgxUiLoaderService,
  ) {
      this.Contrato = data.contrato
  }

  ngOnInit(): void {
    this.consultarEstadoCuenta()
  }

  consultarEstadoCuenta(){
    this.ngxService.startLoader('load-EstadoCuenta')
    let xAPI: IAPICore = {
      funcion: environment.xApi.CONSULTAR_ESTADO_CUENTA,
      parametros: this.Contrato.numero
    }

    this._apiService.Ejecutar(xAPI).subscribe({
      next: (data) =>{
        this.dataSource = new MatTableDataSource<any>(data.Cuerpo)
        this.dataSource.paginator = this.paginator;
        this.ngxService.stopLoader('load-EstadoCuenta')
      },
      error: (err) => {
        console.error(err)
        this.ngxService.stopLoader('load-EstadoCuenta')
      }
    })
  }

}
