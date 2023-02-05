import { Component, OnInit } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Aportes } from 'src/app/services/banfanb/aportes.service';

@Component({
  selector: 'app-aportes',
  templateUrl: './aportes.component.html',
  styleUrls: ['./aportes.component.scss']
})
export class AportesComponent implements OnInit {

  public Aporte : Aportes = {
    numero: '',
    estatus: false,
    fecharecepcion: new Date().toISOString().substr(0,10),
    fechavalor: new Date().toISOString().substr(0,10),
    cedula: '',
    nombre: '',
    apellido: '',
    contrato: '',
    nombrecontrato: '',
    portafolio: '',
    nombredepositante: '',
    apellidodepositante: '',
    agencia: '',
    numerocuenta: '',
    movimiento: '',
    numerodocumento: '',
    numerocheque: '',
    banco: '',
    aprobadopor: '',
    totalefectivo: 0,
    totalcheque: 0,
    totalplanilla: 0,
    aprobado: false,
  }

  public lstAportes = []
  public selectedIndex = 0;
  public active: boolean = false
  public nombrecontrato : string = ''

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  constructor(
    private apiService: ApiService,

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

    this.Aporte = e
    this.selectedIndex = 1
    this.active = true
  }


  Listar() {
    this.xAPI.funcion = "FID_CAportes"
    this.xAPI.parametros = ''


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        this.lstAportes = data
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }

  Consultar() {
    this.xAPI.funcion = "FID_CAporte"
    this.xAPI.parametros = this.Aporte.numero


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Aporte = data[0]
        } else {
          let aux = this.Aporte.numero
          this.Limpiar()
          this.Aporte.numero = aux
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }
  Limpiar(){
  }



  Guardar() {
    var obj = {
      "coleccion": "aportes",
      "objeto": this.Aporte,
      "donde": `{\"numero\":\"${this.Aporte.numero}\"}`,
      "driver": "MDBFIDE",
      "upsert": true
    }

    this.apiService.ExecColeccion(obj).subscribe(
      (data) => {
        console.log(data)
      },
      (error) => {
        console.log(error)
      }
    )
  }


  ConsultarAfiliado(){
    this.xAPI.funcion = "FID_CAfiliado"
    this.xAPI.parametros = this.Aporte.cedula
    console.log(this.xAPI)
    
    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log(data)
        if (data != null) {
          this.Aporte.nombre = data[0].pnombre
          this.Aporte.apellido = data[0].papellido
        } 
      },
      (error) => {
        this.Limpiar()
      }
    )
  }

  ConsultarContrato(){
    this.xAPI.funcion = "FID_CContrato"
    this.xAPI.parametros = this.Aporte.contrato


    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        if (data != null) {
          this.Aporte.nombrecontrato = data[0].razonsocial
        }
      },
      (error) => {
        console.log(error)
        this.Limpiar()
      }
    )
  }
}
