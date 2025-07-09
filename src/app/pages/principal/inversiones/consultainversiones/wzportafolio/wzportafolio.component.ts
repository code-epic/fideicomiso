import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { Inversion, InversionPortafolio } from 'src/app/services/banfanb/inversiones.service';
import { UtilService } from 'src/app/services/util/util.service';
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
  public editando: boolean = false
  public index: number = null
  public editado: boolean = false

  public valor_inversion = null

  public porcentaje : any = 0

  public monto = 0
  public monto_general: any = 0

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

  bloquearMonto = false;
  bloquearPorcentaje = false;

  constructor(
    private apiService: ApiService, 
    private _util: UtilService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.Inversiones = this.data
    this.valor_inversion = this.Inversiones.valor_nominal
    this.Consultar()
    this.ListarPortafolio()
  }

  
  Consultar() {
    this.xAPI.funcion = environment.xApi.CONSULTAR_INVERSIONES_PORTAFOLIO
    this.xAPI.parametros = this.Inversiones.identificador.toString()
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {
        this.lstInversiones = data.Cuerpo
        if( this.lstInversiones!= undefined ) {
          this.total =  this.lstInversiones.reduce((sum, e) => sum + parseFloat(e.porcentaje), 0)
          this.editado = true
        }else{
          this.editado = false
        }

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
        this.lstDataPortafolio = data.Cuerpo
      },
      (error) => {
        console.error(error)
      }
    )
  } 

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    return charCode >= 48 && charCode <= 57;
  }

  habilitar(): boolean {
    const camposLlenos= this.portafolio !== '1' &&
                        this.monto_general !== null &&
                        this.porcentaje !== null &&
                        this.porcentaje > 0; 

    if (!camposLlenos) {
      return true;
    }

    const porcentajeNumerico = Number(this.porcentaje);

    const porcentajeRestante = 100 - this.total;

    if (porcentajeNumerico > porcentajeRestante) {
      return true;
    }

    return false;
  }

  getStatus(status): string {
    return status == '1' ? 'ACTIVO' : 'INACTIVO'
  }

  Agregar() {
    const portf = this.portafolio.split('|')
    const fecha = new Date()
    const fechaFormato = this._util.ConvertirFechaDB(fecha)
      const iPor = {
        id_inversion : this.Inversiones.identificador,
        id_portafolio : parseInt( portf[0]),
        descripcion : portf[1],
        porcentaje : parseFloat(this.porcentaje),
        estatus : 1,
        usuario: '',
        fecha: fechaFormato
      }
      this.total += parseFloat(this.porcentaje)
      this.blSave = this.total == 100

      this.valor_inversion -= Number(this.monto_general)
      this.Limpiar()

    if(this.editando){
      this.lstInversiones[this.index] = iPor
      this.editando = false
    }else{
      this.lstInversiones.push(iPor)
    }

  }

  editar(e: any, i: number){
    this.porcentaje = e.porcentaje
    this.portafolio = e.id_portafolio + '|' + e.descripcion 
    this.editando = true
    this.total -= e.porcentaje
    this.index = i
  }

  Commit() {
    if (this.editado) {
      this.Borrar().subscribe({
        next: () => {
          this.ejecutarInserciones();
          this.editando = false
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      this.ejecutarInserciones();
    }
  }

  private ejecutarInserciones() {
    this.xAPI.funcion = environment.xApi.INSERTAR_INVERSIONES_PORTAFOLIO;
    this.xAPI.parametros = '';

    this.lstInversiones.forEach(inv => {
      this.xAPI.valores = JSON.stringify(inv);
      this.apiService.Ejecutar(this.xAPI).subscribe({
        next: (data) => {
          this.apiService.Mensaje('Proceso exitoso', 'Felicitaciones', 'success', 'inversion');
          this.Consultar();
          this.Limpiar();
        },
        error: (err) => {
          console.error(err);
        }
      });
    });
  }

  // La función Borrar ahora debe devolver el observable
  Borrar():Observable<any> {
    const xAPI: IAPICore = {
      funcion: environment.xApi.BORRAR_INVERSIONES_PORTAFOLIO,
      parametros: this.Inversiones.identificador.toString(),
      valores: ''
    };
    return this.apiService.Ejecutar(xAPI)
  }

  private Limpiar() {
    this.porcentaje = 0.00
    this.monto_general = 0
    this.portafolio = null
  }


  ConsultarMontoPortafolio(){
    const portf = this.portafolio.split('|')
    this.xAPI.funcion = environment.xApi.CONSULTAR_MONTO_PORTAFOLIO
    this.xAPI.parametros = portf[0]
    this.xAPI.valores = ''
    this.apiService.Ejecutar(this.xAPI).subscribe({
      next: (data) => { 
        console.log(data)       
        this.monto = data.Cuerpo.reduce((sum, e) => sum + parseFloat(e.monto), 0)
        this.monto_general = data.Cuerpo.reduce((sum, e) => sum + parseFloat(e.monto_general), 0)
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  private editandoPorcentaje = false;
  private editandoMonto = false;

  onPorcentajeChange() {
    if (this.editandoMonto) return; // Evita bucle
    this.editandoPorcentaje = true;
    const valor = Number(this.Inversiones.valor_nominal);
    if (this.porcentaje !== null && this.porcentaje !== undefined && this.porcentaje !== '') {
      const porcentajeNum = Number(this.porcentaje);
      if (!isNaN(porcentajeNum) && this.Inversiones?.valor_nominal) {
        this.monto_general = ((porcentajeNum / 100) * valor).toFixed(2);
        this.bloquearMonto = true;
        this.bloquearPorcentaje = false;
      }
    } else {
      this.bloquearMonto = false;
    }
    this.editandoPorcentaje = false;
  }

  onMontoChange() {
    if (this.editandoPorcentaje) return; // Evita bucle
    this.editandoMonto = true;
    const valor = Number(this.Inversiones.valor_nominal);
    if (this.monto_general !== null && this.monto_general !== undefined && this.monto_general !== '') {
      const montoNum = Number((this.monto_general + '').replace(/[^0-9.]/g, ''));
      if (!isNaN(montoNum) && this.Inversiones?.valor_nominal) {
        this.porcentaje = ((montoNum / valor) * 100).toFixed(2);
        this.bloquearPorcentaje = true;
        this.bloquearMonto = false;
      }
    } else {
      this.bloquearPorcentaje = false;
    }
    this.editandoMonto = false;
  }

  limpiarCampos() {
    this.porcentaje = '';
    this.monto_general = '';
    this.bloquearMonto = false;
    this.bloquearPorcentaje = false;
  }
}
