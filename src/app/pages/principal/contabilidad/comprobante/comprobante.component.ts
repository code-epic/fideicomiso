import { Component, OnInit } from '@angular/core';
import { Semillero } from 'src/app/services/banfanb/semillero';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { UtilService } from 'src/app/services/util/util.service';
import { Comprobante } from 'src/app/services/banfanb/comprobante.service';

@Component({
  selector: 'app-comprobante',
  templateUrl: './comprobante.component.html',
  styleUrls: ['./comprobante.component.css']
})
export class ComprobanteComponent implements OnInit {


  public semillero : Semillero = {
    codigo: 0,
    plan: '',
    descripcion: '',
    fecha: new Date(),
    autor: ''
  }


  public Comprobante: Comprobante = {
    numero: '',
    fecha: '',
    monto_global: 0,
    instrumento: '',
    detalle: '',
    debito: 0,
    credito: 0,
    monto: 0,
    idtra: '',
    cuenta: '',
    tipo_movimiento: '',
    estatus: false
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public fechainicio = new FormControl(new Date());

  public lstComprobante = [];

  public lst = []


  public porta_search = false
  public porta_insert = true
  public focus : boolean = false
  public active: boolean = false
  public buscar = ''
  public selectedIndex = 0;


  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService,
    private util: UtilService
  ) { }

  ngOnInit(): void {
    //this.fechainicio.setValue(this.Contrato.Saldos.fechainicio)
    this.cargarContenido()
    this.GenerarSemillero()
  }

  Buscar(e){

  }

  editar(e){

  }


  tabActive(event) {
   
    this.selectedIndex = event.index
    if (!this.active) {
      this.Limpiar()
      //this.contrato_search = 'none'
      this.GenerarSemillero()
      // this.Listar()
    } else {
      this.active = !this.active
    }

  }

  
  Limpiar(){
    this.Comprobante = {
      numero: '',
      fecha: '',
      monto_global: 0,
      instrumento: '',
      detalle: '',
      debito: 0,
      credito: 0,
      monto: 0,
      idtra: '',
      cuenta: '',
      tipo_movimiento: '',
      estatus: false
    }
  }

  Consultar(){}

  Seleccionar(){}

  GenerarSemillero(){
    this.xAPI.funcion = "FID_CSemilleroContable"
    this.xAPI.parametros = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          let codigo = parseInt(data[0].codigo) + 1
          this.Comprobante.numero = this.util.zfill(codigo, 4)
        
        } else {
          this.Comprobante.numero = "0001"
        }

      },
      (error) => {
        console.log(error)
        //this.Limpiar()
      }
    )
  }

  Guardar(){

  }


  cargarContenido(): any {

    this.lstComprobante = []
    this.xAPI.funcion = "FID_CPlanContable"
    this.xAPI.parametros = ''
    this.xAPI.valores = ""
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstComprobante = data
      },
      (err) => {
        console.error(err)
      }
    )
  }


}
