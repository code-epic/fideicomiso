import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Inversion, InversionPortafolio } from 'src/app/services/banfanb/inversiones.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wzportafolio',
  templateUrl: './wzportafolio.component.html',
  styleUrls: ['./wzportafolio.component.scss']
})
export class WzportafolioComponent implements OnInit {
  public InvPort: InversionPortafolio = {
    id_inversion: 0,
    id_portafolio: 0,
    porcentaje: 0,
    estatus: 0,
    descripcion: '',
    usuario: ''
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: ''
  }

  public portafolio 

  public porcentaje : any = 0

  public monto = 0
  public monto_general = 0

  public lstDataPortafolio = []

  public lstInversiones = []

  public blSave: boolean = false

  public Inversiones: Inversion = {
    identificador: 0,
    tipo_moneda: 0,
    estatus: 0,
    tipo_inversion: 0,
    plazo_vencimiento: 0,
    dias_caidos: 0,
    instrumento: '',
    numero: '',
    pais: 'VENEZUELA',
    codigo_isin: '',
    emisor: '',
    custodio: '',
    fecha_emision: '',
    fecha_compra: '',
    fecha_vencimiento: '',
    id_cartera: 0,
    id_portafolio: 0,
    valor_nominal: 0,
    precio_compra: 0,
    costo_adquisicion: 0,
    tasa_cupon: 0,
    base_calculo: 0,
    rendimiento_cupon: 0,
    plazo_cupon: 0,
    interes_diario: 0,
    rendimiento_vencimiento: 0,
    intereses_caidos: 0,
    amortizacion_diaria: 0,
    primas: 0,
    descuento: 0,
  };

  public lstData = []

  public total = 0
  public totalPorcentaje = 0


  public titulo = 'DETALLES DE LA INVERSION POR PORTAFOLIO'

  constructor(
    private apiService: ApiService, 
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.Inversiones = this.data
    console.log(this.Inversiones)
    this.Consultar()
    this.ListarPortafolio()
  }
  
  Consultar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_INVERSIONES_PORTAFOLIO
    this.xAPI.parametros = this.Inversiones.identificador.toString()
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        console.log(data)
        this.lstInversiones = data.Cuerpo
        if( this.lstInversiones!= undefined ) 
          this.total =  this.lstInversiones.reduce((sum, e) => sum + parseFloat(e.porcentaje), 0)
        this.Limpiar()
      },
      error => {
        console.error(error)

      }
    )
  }

  private ListarPortafolio() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_PORTAFOLIOS
    this.xAPI.parametros = this.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        console.log("CONSULTAR PORTAFOLIOS", data)
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  } 

  getStatus(status): string {
    return status == '1' ? 'ACTIVO' : 'INACTIVO'
  }

  Agregar() {
    const portf = this.portafolio.split('|')
    const iPor = {
      id_inversion : this.Inversiones.identificador,
      id_portafolio : parseInt( portf[0]),
      descripcion : portf[1],
      porcentaje : parseFloat(this.porcentaje),
      estatus : 1
    }
    this.total += parseFloat(this.porcentaje)
    this.lstInversiones.push(iPor)

    this.blSave = this.total == 100
  }

  Commit() {
    this.xAPI.funcion = environment.xApi.INSERTAR_INVERSIONES_PORTAFOLIO
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.InvPort)
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => {
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.Consultar()
        this.Limpiar()
      },
      error: (err) => {
        console.error(err)
      }
  })

  }

  private Limpiar() {
    this.porcentaje = 0.00
    this.portafolio = 1
  }


  ConsultarMontoPortafolio(){
    const portf = this.portafolio.split('|')
    console.log(portf)
    this.xAPI.funcion = environment.xApi.CONSULTAR_MONTO_PORTAFOLIO
    this.xAPI.parametros = portf[0]
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {        
        console.log(data)
        this.monto = data.Cuerpo.reduce((sum, e) => sum + parseFloat(e.monto), 0)
        this.monto_general = data.Cuerpo.reduce((sum, e) => sum + parseFloat(e.monto_general), 0)
      },
      error => {
        console.error(error)

      }
    )
  }
}
