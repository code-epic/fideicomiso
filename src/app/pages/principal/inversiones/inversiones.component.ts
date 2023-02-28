import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Inversiones } from 'src/app/services/banfanb/inversiones.service';

@Component({
  selector: 'app-inversiones',
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.scss']
})
export class InversionesComponent implements OnInit {


  public Inversiones: Inversiones = {
    codigo: '',
    descripcion: '',
    grupo: '',
    limite: '',
    moneda: '',
    calculo: '',
    contabilidad: '',
    totalinvertido: 0,
    codigobcv: '',
    codigoisin: '',
    decreto: '',
    emision: '',
    valorinicial: '',
    monedaextranjera: '',
    estatus: 0,
    fecha: new Date(),
    autor: ''
  }


  public lstInversiones = []

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }


  public inver_insert: string = ''
  public inver_search: string = 'none'


  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {

    this.ListarInver()
  }

  tabActive(event) {
    // this.selectedIndex = event.index
    // if (!this.active) {
    //   this.Listar()
    //   this.Limpiar()
    // } else {
    //   this.active = !this.active
    // }

  }



  editarInver(e) {
    this.Inversiones = e
    this.inver_insert = ''
    this.inver_search = 'none'
  }


  LimpiarInver() {
    this.Inversiones = {
      codigo: '',
      descripcion: '',
      grupo: '',
      limite: '',
      moneda: '',
      calculo: '',
      contabilidad: '',
      totalinvertido: 0,
      codigobcv: '',
      codigoisin: '',
      decreto: '',
      emision: '',
      valorinicial: '',
      monedaextranjera: '',
      estatus: 0,
      fecha: new Date(),
      autor: ''
    }

  }
  ListarInver() {
    this.lstInversiones = []
    this.xAPI.funcion = "FID_CInversiones"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) this.lstInversiones = data
      },
      (error) => {
        console.log(error)
        this.LimpiarInver()
      }
    )
  }





  ConsultarInver() {
    this.xAPI.funcion = "FID_CInversion"
    this.xAPI.parametros = this.Inversiones.codigo
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) {
          this.Inversiones = data[0]
        } else {
          let aux = this.Inversiones.codigo
          this.LimpiarInver()
          this.Inversiones.codigo = aux
        }
      },
      (error) => {
        console.log(error)
        this.LimpiarInver()
      }
    )
  }


  SeleccionarInversiones() {
    this.ListarInver()
    this.inver_insert = 'none'
    this.inver_search = ''
  }





  GuardarInversiones() {
    if (this.Inversiones.codigo == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-inver')
    var obj = {
      "coleccion": "inversiones",
      "objeto": this.Inversiones,
      "donde": `{\"codigo\":\"${this.Inversiones.codigo}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.ngxService.stopLoader('load-inver')
        this.LimpiarInver()
      },
      (error) => {
        console.log(error)
      }
    )
  }

}
