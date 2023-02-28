import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Empresa } from 'src/app/services/banfanb/administracion';
import { Direccion } from 'src/app/services/banfanb/afiliado.service';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }
  public Direccion: Direccion = {
    direccion: '',
    pais: '',
    ciudad: '',
    municipio: '',
    parroquia: '',
    codigopostal: '',
    urbanizacion: '',
    telefono: '',
    celular: '',
    correo: '',
    oficinanacional: ''
  }

  public Empresa: Empresa = {
    rif: '',
    razonsocial: '',
    Direccion: this.Direccion
  }

  public lstEmpresa: []

  public empre_insert: string = ''
  public empre_search: string = 'none'

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
  }

  editar(e) {
    this.Empresa = e
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = "FID_CEmpresas"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) this.lstEmpresa = data
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {

    this.xAPI.funcion = "FID_CEmpresa"
    this.xAPI.parametros = this.Empresa.rif

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null && data.msj == undefined) {
          this.Empresa = data[0]
        } else {
          let aux = this.Empresa.rif
          this.Limpiar()
          this.Empresa.rif = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Seleccionar() {
    this.Listar()
    this.empre_insert = 'none'
    this.empre_search = ''
  }

  Limpiar() {
    this.Direccion = {
      direccion: '',
      pais: '',
      ciudad: '',
      municipio: '',
      parroquia: '',
      codigopostal: '',
      urbanizacion: '',
      telefono: '',
      celular: '',
      correo: '',
      oficinanacional: ''
    }

    this.Empresa = {
      rif: '',
      razonsocial: '',
      Direccion: this.Direccion
    }
  }


  Guardar() {

    if (this.Empresa.rif == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-inver')
    var obj = {
      "coleccion": "empresa",
      "objeto": this.Empresa,
      "donde": `{\"rif\":\"${this.Empresa.rif}\"}`,
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
