import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Inversiones } from 'src/app/services/banfanb/inversiones.service';
import { Portafolio } from 'src/app/services/banfanb/portafolio.service';

@Component({
  selector: 'app-inversiones',
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.scss']
})
export class InversionesComponent implements OnInit {


  public Portafolio: Portafolio = {
    codigo: '',
    descripcion: '',
    moneda: '',
    frecuencia: '',
    distribucion: '',
    tipo: '',
    numerocuenta: '',
    valormercado: '',
    fecha: new Date(),
    autor: ''
  }


  public Inversiones: Inversiones = {
    codigo: '',
    descripcion: '',
    grupo: '',
    limitecartera: 0,
    monedaoperaciones: '',
    calculocosto: 0,
    contabilidadcomo: '',
    totalinvertido: 0,
    codigobcv: '',
    codigoisin: '',
    decreto: '',
    emision: '',
    valorinicial: 0,
    monedaextranjera: 0,
    estatus: 0,
    fecha: new Date(),
    autor: ''
  }


  public lstPortafolio = []
  public lstInversiones = []

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
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

  editar(e) {
    // this.Aporte = e
    // this.selectedIndex = 1
    // this.active = true
  }


  Listar() {
    // this.xAPI.funcion = "FID_CAportes"
    // this.xAPI.parametros = ''
    // this.apiService.Ejecutar(this.xAPI).subscribe(
    //   (data) => {
    //     this.lstAportes = data
    //   },
    //   (error) => {
    //     console.log(error)
    //     this.Limpiar()
    //   }
    // )
  }

  Consultar() {

    this.xAPI.funcion = "FID_CPortafolio"
    this.xAPI.parametros = this.Portafolio.codigo

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
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
    
  }


  ConsultarInventario() {
    this.xAPI.funcion = "FID_CInventario"
    this.xAPI.parametros = this.Inversiones.codigo
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Inversiones = data[0]
        } else {
          let aux = this.Inversiones.codigo
          this.Limpiar()
          this.Inversiones.codigo = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Limpiar() {
    this.Portafolio = {
      codigo: '',
      descripcion: '',
      moneda: '',
      frecuencia: '',
      distribucion: '',
      tipo: '',
      numerocuenta: '',
      valormercado: '',
      fecha: new Date(),
      autor: ''
    }

  }



  Guardar() {

    if (this.Portafolio.codigo == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-inver')
    var obj = {
      "coleccion": "portafolio",
      "objeto": this.Portafolio,
      "donde": `{\"codigo\":\"${this.Portafolio.codigo}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
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

  GuardarInversiones() {
    if (this.Inversiones.codigo == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-inver')
    var obj = {
      "coleccion": "inversiones",
      "objeto": this.Portafolio,
      "donde": `{\"codigo\":\"${this.Inversiones.codigo}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
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
