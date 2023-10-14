import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Portafolio } from 'src/app/services/banfanb/portafolio.service';
import { UtilService } from 'src/app/services/util/util.service';
@Component({
  selector: 'app-portafolio',
  templateUrl: './portafolio.component.html',
  styleUrls: ['./portafolio.component.scss']
})
export class PortafolioComponent implements OnInit {
  public Portafolio: Portafolio = {
    codigo: '',
    descripcion: '',
    moneda: '',
    frecuencia: '',
    distribucion: '',
    tipo: '',
    numerocuenta: '',
    valormercado: '',
    autor: ''
  }


  public lstPortafolio = []
  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public porta_insert : string = ''
  public porta_search : string = 'none'
  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private utilService : UtilService,
    private ngxService: NgxUiLoaderService) { 
      this.Portafolio.codigo = this.utilService.GenerarUnicId()

    }

  ngOnInit(): void {
    this.Listar()
  }

  atras(){
    this.porta_insert = ''
    this.porta_search = 'none'
  }

  editar(e) {
    this.Portafolio = e
    this.porta_insert = ''
    this.porta_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = "FID_CPortafolios"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(

      (data) => {
        // console.log(data)
        if (data != null && data.msj == undefined) this.lstPortafolio = data.Cuerpo
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {

    this.xAPI.funcion = "FID_CPortafolio"
    this.xAPI.parametros = this.Portafolio.codigo

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          this.Portafolio = data[0]
        } else {
          let aux = this.Portafolio.codigo
          this.Limpiar()
          this.Portafolio.codigo = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Seleccionar(){
    this.Listar()
    this.porta_insert = 'none'
    this.porta_search = ''
  }


  Limpiar() {
    this.Portafolio = {
      codigo: this.utilService.GenerarUnicId(),
      descripcion: '',
      moneda: '',
      frecuencia: '',
      distribucion: '',
      tipo: '',
      numerocuenta: '',
      valormercado: '',
      autor: ''
    }

  }



  Guardar() {

    if (this.Portafolio.codigo == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-inver')
    // var obj = {
    //   "coleccion": "portafolio",
    //   "objeto": this.Portafolio,
    //   "donde": `{\"codigo\":\"${this.Portafolio.codigo}\"}`,
    //   "driver": "MDBFIDE",
    //   "upsert": true
    // }
    this.xAPI.funcion = 'FID_IPortafolio'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.Portafolio)


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.ngxService.stopLoader('load-inver')
        this.Limpiar()
      },
      (error) => {
        console.log(error)
      }
    )
  }


}
