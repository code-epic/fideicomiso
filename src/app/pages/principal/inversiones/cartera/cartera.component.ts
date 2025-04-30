import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService, IAPICore } from 'src/app/services/apicore/api.service';
import { ImprimirService } from 'src/app/services/util/imprimir.service';
import { UtilService } from 'src/app/services/util/util.service';

@Component({
  selector: 'app-cartera',
  templateUrl: './cartera.component.html',
  styleUrls: ['./cartera.component.scss']
})
export class CarteraComponent implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    valores: '',
    parametros: ''
  }

  public total_a: number = 0
  public balance_a: number = 0
  public total_b: number = 0
  public balance_b: number = 0
  public dif_a: number = 0
  public dif_b: number = 0
  public fechai: any
  public bVista: boolean = false
  public fecha_al: string = ''

  public lstCartera = []



  constructor(
    private util: UtilService,
    private toasService: ToastrService,
    private apiService: ApiService,
    private _imprimir: ImprimirService
  ) { }

  ngOnInit(): void { }

  CalcularDias(fechai, fechaf): number {
    let calculo = this.util.CalcuarDiasTranscurridos(fechai, fechaf) + 1

    return calculo
  }

  iniciarContadores() {
    this.total_a = 0
    this.balance_a = 0
    this.total_b = 0
    this.balance_b = 0
    this.dif_a = 0
    this.dif_b = 0
  }

  ConsultarCarteraAl() {

    this.bVista = false

    if (this.fechai == undefined) {
      this.toasService.warning("Debe seleccionar una fecha ", "Fideicomiso")
      return
    }

    let saldoAl = new Date(this.fechai).toISOString().substring(0, 10)

    let fini = saldoAl.substring(0, 8) + '01'
    let ffin = saldoAl



    this.fecha_al = ffin

    this.xAPI.funcion = 'FID_CCarteraInversiones'
    this.iniciarContadores()

    this.xAPI.parametros = `${fini},${ffin},${ffin}`
    this.apiService.Ejecutar(this.xAPI).subscribe(
      data => {        
        this.lstCartera = data.Cuerpo
        if (this.lstCartera.length > 0) {
          this.lstCartera.forEach(e => {
            this.total_a += parseFloat(e.costo_adquisicion)
            this.balance_a += parseFloat(e.costo_adquisicion)

            this.total_b += this.InteresDiarioCupon(e, this.CalcularDias( e.fecha_compra, this.fecha_al ))
            this.balance_b = this.total_b
          });

          this.bVista = true
        }else{
          this.toasService.warning("No existen inversiones este dia", "Fideicomiso")
        }
      },
      error => {
        console.error('Saliendo, ', error)
      }
    )
  }

  getMoneda(numero: number): string {
    let valor = this.util.ConvertirMoneda(numero)
    let result = valor.toString()
    let cant = result.split(',')
   
    if (cant.length == 1 )
      result = result + ',00'

    return result
  }


  InteresDiarioCupon(inv: any, dias: number): number {

    let rendicion =
      ((inv.valor_nominal * inv.tasa_cupon * (1 / 100)) / inv.base_calculo) * dias

    
    return parseFloat(rendicion.toFixed(2));
  }

  getFechaIFormateada():string{
    if (!this.fechai) {
      return '';
    }
    const fecha = new Date(this.fechai);
    const dia = String(fecha.getDate()).padStart(2, '0'); 
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  imprimir(){
    const p = document.getElementById("DivPrintPage").innerHTML;
    this._imprimir.createHtmlSectionForPrint(p, 1,  'size: landscape;');
  }
}
