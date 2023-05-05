import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Afiliado, Direccion } from 'src/app/services/banfanb/afiliado.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ejecutivos',
  templateUrl: './ejecutivos.component.html',
  styleUrls: ['./ejecutivos.component.css']
})
export class EjecutivosComponent implements OnInit {
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

  public Ejecutivo: Afiliado = {
    nacionalidad: '',
    cedula: '',
    estatus: 0,
    estadocivil: '',
    pnombre: '',
    smombre: '',
    papellido: '',
    sapellido: '',
    sexo: '',
    nacimiento: '',
    ingreso: '',
    actividad: '',
    Direccion: this.Direccion
  }

  public nacimiento = new FormControl(new Date());
  public ingreso = new FormControl(new Date());

  public lstEjecutivos: []
    
  public lstPaises = []

  public lstCiudades = []

  public lstEstados = []

  public empre_insert: string = ''
  public empre_search: string = 'none'

  constructor(private apiService: ApiService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.Listar()
    this.ListarPaises()
    this.ListarEstados()
  }

  atras(){
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  editar(e) {
    this.Ejecutivo = e
    this.empre_insert = ''
    this.empre_search = 'none'
  }

  Listar() {
    this.xAPI.funcion = "FID_CEjecutivos"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null && data.msj == undefined) this.lstEjecutivos = data
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }
  ListarPaises() {
    this.xAPI.funcion = "ListarPaises"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstPaises = data.Cuerpo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ListarEstados() {
    this.xAPI.funcion = "ListarEstados"
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstEstados = data.Cuerpo
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ListarCiudades() {
    this.xAPI.funcion = "ListarCiudad"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstCiudades = data
      },
      (error) => {
        console.log(error)
      }
    )
  }
  Consultar() {

    this.xAPI.funcion = "FID_CEjecutivo"
    this.xAPI.parametros = this.Ejecutivo.cedula

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null && data.msj == undefined) {
          this.Ejecutivo = data[0]
        } else {
          let aux = this.Ejecutivo.cedula
          this.Limpiar()
          this.Ejecutivo.cedula = aux
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

    this.Ejecutivo = {
      nacionalidad: '',
      cedula: '',
      estatus: 0,
      estadocivil: '',
      pnombre: '',
      smombre: '',
      papellido: '',
      sapellido: '',
      sexo: '',
      nacimiento: '',
      ingreso: '',
      actividad: '',
      Direccion: this.Direccion
    }
  }


  Guardar() {

    if (this.Ejecutivo.cedula == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }
    this.ngxService.startLoader('load-ejecutivo')

    let n = new Date(this.nacimiento.value).toISOString()
    let i = new Date(this.ingreso.value).toISOString()
    this.Ejecutivo.nacimiento = n
    this.Ejecutivo.ingreso = i


    var obj = {
      "coleccion": "ejecutivo",
      "objeto": this.Ejecutivo,
      "donde": `{\"cedula\":\"${this.Ejecutivo.cedula}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.ngxService.stopLoader('load-ejecutivo')
        this.Limpiar()
      },
      (error) => {
        console.log(error)
      }
    )
  }


}


