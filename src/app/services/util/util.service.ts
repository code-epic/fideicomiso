import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UtilService {
  //
  constructor() {}

  /**
   * Fecha Actual del sistema desde la application
   * @param dias sumar dias a la fecha actual
   * @returns retorna la fecha actual del sistema en formato YYYY-MM-DD
   */
  FechaActual(dias: number = 0): string {
    let date = new Date();

    if (dias > 0) date.setDate(date.getDate() + dias);

    let output =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return output;
  }
  //retorna fecha en formato Dia/Mes/Anio
  ConvertirFecha(fecha: any): string {
    return fecha.year + "-" + +fecha.month + "-" + fecha.day;
  }

  Semillero(id: string): string {
    var f = new Date();
    var anio = f.getFullYear().toString().substring(2, 4);
    var mes = this.zfill((f.getMonth() + 1).toString(), 2);
    var dia = this.zfill(f.getDate().toString(), 2);
    return anio + mes + dia + "-" + this.zfill(id, 5);
  }

  public zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */
    var zero = "0"; /* String de cero */

    if (width <= length) {
      if (number < 0) {
        return "-" + numberOutput.toString();
      } else {
        return numberOutput.toString();
      }
    } else {
      if (number < 0) {
        return "-" + zero.repeat(width - length) + numberOutput.toString();
      } else {
        return zero.repeat(width - length) + numberOutput.toString();
      }
    }
  }

  //convertir cadena a minuscula y sin carateres especiales
  ConvertirCadena(cadena: string): string {
    return cadena
      .toLowerCase()
      .replace(/á/g, "a")
      .replace(/ê/g, "i")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u");
  }
  /**
   * Generar Unico ID
   * @returns string
   */
  GenerarUnicId(): string {
    return Math.random().toString(36).substr(2, 18);
  }

  //Recibe  Fecha Formato: AAAA-MM-DD 00:00:00
  //Retorna Fecha Formato: DD/MM/AAAA
  ConvertirFechaHumana(f) {
    var ISODate = new Date(f).toISOString();
    var fe = ISODate.substr(0, 10);
    var fa = fe.split("-");
    if (fa[0] != "0001") {
      return fa[2] + "/" + fa[1] + "/" + fa[0];
    } else {
      return "1900-01-01";
    }
    //return fa[2] + "/" + fa[1] + "/" + fa[0];
  }

  //Recibe  Fecha Formato: DD/MM/AAAA
  //Retorna Fecha Formato: AAAA-MM-DD
  ConvertirFechaDB(f: any): string {
    var faux = "";
    if (typeof f != "object") {
      faux = "1900-01-01";
      if (f != undefined && f != "") {
        var fx = f.split("/");
        faux = fx[2] + "-" + fx[1] + "-" + fx[0];
      }
      return faux;
    } else {
      var ISODate = new Date(f).toISOString();
      var fe = ISODate.substr(0, 10);
      var fa = fe.split("-");
      if (fa[0] != "0001") {
        return fa[0] + "-" + fa[1] + "-" + fa[2];
      } else {
        return "1900-01-01";
      }
    }
  }

  //AAAA-MM-DD
  CalcuarDiasTranscurridos(fechai, fechaf): number {
    var fechaInicio = new Date(fechai).getTime();
    var fechaFin = new Date(fechaf).getTime();
    var diff = fechaFin - fechaInicio;
    return diff / (1000 * 60 * 60 * 24);
  }
}
