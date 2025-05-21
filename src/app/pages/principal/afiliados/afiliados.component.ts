import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Afiliado, Direccion } from 'src/app/services/banfanb/afiliado.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-afiliados',
  templateUrl: './afiliados.component.html',
  styleUrls: ['./afiliados.component.scss']
})

export class AfiliadosComponent implements OnInit {

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

  public Afiliado: Afiliado = {
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
  public lstAfiliados = []
  public selectedIndex = 0;
  public active: boolean = false

  public nacimiento = new FormControl(new Date());
  public ingreso = new FormControl(new Date());

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  constructor(
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private ngxService: NgxUiLoaderService

  ) { }

  ngOnInit(): void {
    this.Listar()
  }

  tabActive(event) {
    this.selectedIndex = event.index
    if (!this.active) {
      this.Listar()
      this.Limpiar()
    } else {
      this.active = !this.active
    }

  }

  editar(e) {
    this.Afiliado = e
    this.selectedIndex = 1
    this.active = true
    this.nacimiento.setValue(this.Afiliado.nacimiento)
    this.ingreso.setValue(this.Afiliado.ingreso)
  }


  Listar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_AFILIADOS
    this.xAPI.parametros = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstAfiliados = data
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {
    this.xAPI.funcion = "FID_CAfiliado"
    this.xAPI.parametros = this.Afiliado.cedula

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Afiliado = data[0]
          this.nacimiento.setValue(this.Afiliado.nacimiento)
          this.ingreso.setValue(this.Afiliado.ingreso)
        } else {
          let aux = this.Afiliado.cedula
          this.Limpiar()
          this.Afiliado.cedula = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
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
    this.Afiliado = {
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


  /**
   * Guardar elementos
   */
  Guardar() {

    if (this.Afiliado.cedula == "") {
      this._snackBar.open('Debe verificar todos los campos...', 'dance')
      return
    }

    this.ngxService.startLoader('load-afi')

    let n = new Date(this.nacimiento.value).toISOString()
    let i = new Date(this.ingreso.value).toISOString()
    this.Afiliado.nacimiento = n
    this.Afiliado.ingreso = i

    var obj = {
      "coleccion": "afiliados",
      "objeto": this.Afiliado,
      "donde": `{\"rif\":\"${this.Afiliado.cedula}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
        this.Limpiar()
        this.ngxService.stopLoader('load-afi')
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'afiliado')


      },
      (error) => {
        console.log(error)

      }
    )
  }

}
