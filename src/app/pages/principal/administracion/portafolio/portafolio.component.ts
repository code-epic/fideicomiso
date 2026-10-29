import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Portafolio } from 'src/app/services/banfanb/portafolio.service';
import { UtilService } from 'src/app/services/util/util.service';
import { environment } from 'src/environments/environment';
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
    porcentaje: 0,
    autor: ''
  }


  public lstPortafolio = []
  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public porta_insert : string = ''
  public porta_search : string = 'none'
  public esEdicion : boolean = false
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
    this.esEdicion = true
    this.porta_insert = ''
    this.porta_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_PORTAFOLIOS
    this.xAPI.parametros = ''
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(

      (data) => {
        if (data != null && data.msj == undefined) this.lstPortafolio = data.Cuerpo
      },
      (error) => {
        console.error(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {

    this.xAPI.funcion = environment.xApi.CONSULTAR_PORTAFOLIO
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
        console.error(error)
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
      porcentaje : 0,
      autor: ''
    }

  }



  Guardar() {
    if (!this.Portafolio.descripcion || this.Portafolio.descripcion.trim() === '') {
      this._snackBar.open('Debe indicar la descripción.', 'Ok')
      return
    }
    if (!this.Portafolio.moneda || this.Portafolio.moneda.trim() === '') {
      this._snackBar.open('Debe seleccionar la moneda.', 'Ok')
      return
    }
    if (!this.Portafolio.porcentaje || this.Portafolio.porcentaje <= 0) {
      this._snackBar.open('Debe indicar el máximo de inversión.', 'Ok')
      return
    }

    this.ngxService.startLoader('load-inver')

    this.Portafolio.frecuencia = this.Portafolio.frecuencia || ''
    this.Portafolio.distribucion = this.Portafolio.distribucion || ''
    this.Portafolio.tipo = this.Portafolio.tipo || ''
    this.Portafolio.numerocuenta = this.Portafolio.numerocuenta || ''
    this.Portafolio.valormercado = this.Portafolio.valormercado || ''
    this.Portafolio.autor = this.Portafolio.autor || ''

    if (this.esEdicion) {
      this.xAPI.funcion = environment.xApi.ACTUALIZAR_PORTAFOLIO
      this.xAPI.parametros = `${this.Portafolio.codigo},${this.Portafolio.descripcion},${this.Portafolio.moneda},${this.Portafolio.tipo},${this.Portafolio.frecuencia},${this.Portafolio.distribucion},${this.Portafolio.numerocuenta},${this.Portafolio.valormercado}`
      this.xAPI.valores = ''
    } else {
      this.xAPI.funcion = environment.xApi.INSERTAR_PORTAFOLIO
      this.xAPI.parametros = ''
      this.xAPI.valores = JSON.stringify(this.Portafolio)
    }

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.apiService.Mensaje('Proceso exitoso', 'Portafolio guardado correctamente', 'success', 'portafolio')
        this.ngxService.stopLoader('load-inver')
        this.esEdicion = false
        this.Limpiar()
        this.Listar()
        this.porta_insert = 'none'
        this.porta_search = ''
      },
      (error) => {
        console.error(error)
        this.ngxService.stopLoader('load-inver')
      }
    )
  }

  soloNumerico(event: KeyboardEvent): boolean {
    const permitidas = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'F5'];
    if (permitidas.includes(event.key)) return true;
    if (event.ctrlKey || event.metaKey) return true;
    if (event.key.length === 1 && !/^[0-9.]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }


}
