import { Component, Input, OnInit } from '@angular/core';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Inversion, InversionPortafolio } from 'src/app/services/banfanb/inversiones.service';
import { MensajeService } from 'src/app/services/util/mensaje.service';

@Component({
  selector: 'app-wzportafolio',
  templateUrl: './wzportafolio.component.html',
  styleUrls: ['./wzportafolio.component.css']
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
  @Input() xinver: string

  public portafolio

  public porcentaje

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

  constructor(private apiService: ApiService, private msj: MensajeService) {

  }

  ngOnInit(): void {
    this.ListarPortafolio()

  }


  ngOnChanges() {
    this.Inversiones = JSON.parse(this.xinver)
    this.Consultar()



  }

  getStatus(status): string {
    return status == '1' ? 'ACTIVO' : 'INACTIVO'
  }

  Agregar() {
    let portf = this.portafolio.split('|')
    let iPor = {
      'id_inversion' : this.Inversiones.identificador,
      'id_portafolio' : parseInt( portf[0]),
      'descripcion' : portf[1],
      'porcentaje' : parseFloat(this.porcentaje),
      'estatus' : 1
    }
    this.total += parseFloat(this.porcentaje)
    this.lstInversiones.push(iPor)

    this.blSave = this.total == 100 ? true : false
   
  }

  Commit() {


    this.xAPI.funcion = 'FID_IInversionesPortafolio'
    this.xAPI.parametros = ''
    this.xAPI.valores = JSON.stringify(this.InvPort)
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion')
        this.Consultar()
        this.Limpiar()
      },
      error => {
        console.error(error)

      }
    )

  }

  Consultar() {
    console.info(this.Inversiones)
    this.xAPI.funcion = 'FID_CInversionesPortafolio'
    this.xAPI.parametros = this.Inversiones.identificador.toString()
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {

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

  Limpiar() {
    this.porcentaje = 0.00
    this.portafolio = 1

  }


  ListarPortafolio() {
    this.xAPI.funcion = "FID_CPortafolios"
    this.xAPI.parametros = this.portafolio

    this.apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.log(error)

      }
    )

  } 
  
  Close(){

  }
}
