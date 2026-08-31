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
  //retorna fecha en formato AAAA-MM-DD
  ConvertirFecha(fecha: any): string {
    return fecha.year + "-" + String(fecha.month).padStart(2, "0") + "-" + String(fecha.day).padStart(2, "0");
  }

  Semillero(id: string): string {
    const f = new Date();
    const anio = f.getFullYear().toString().substring(2, 4);
    const mes = this.zfill((f.getMonth() + 1).toString(), 2);
    const dia = this.zfill(f.getDate().toString(), 2);
    return anio + mes + dia + "-" + this.zfill(id, 5);
  }

  public zfill(number, width) {
    const numberOutput = Math.abs(number); /* Valor absoluto del número */
    const length = number.toString().length; /* Largo del número */
    const zero = "0"; /* String de cero */

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
    if (f == undefined ) return "1900-01-01"
      const ISODate = new Date(f).toISOString();
      const fe = ISODate.substr(0, 10);
      const fa = fe.split("-");
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
        if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
          return f;
        }
        const fx = f.split("/");
        faux = fx[2] + "-" + fx[1] + "-" + fx[0];
      }
      return faux;
    } else {
      // Detectar NgbDate (tiene year, month, day)
      if (f.year && f.month && f.day) {
        return `${f.year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`;
      }
      const ISODate = new Date(f).toISOString();
      const fe = ISODate.substr(0, 10);
      const fa = fe.split("-");
      if (fa[0] != "0001") {
        return fa[0] + "-" + fa[1] + "-" + fa[2];
      } else {
        return "1900-01-01";
      }
    }
  }

  //AAAA-MM-DD
  CalcuarDiasTranscurridos(fechai, fechaf): number {
    const fechaInicio = new Date(fechai).getTime();
    const fechaFin = new Date(fechaf).getTime();
    const diff = fechaFin - fechaInicio;
    return diff / (1000 * 60 * 60 * 24);
  }

  ConvertirMoneda(numero: number): any {
    let formatted = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numero);
    return formatted;
  }

  downloadFile(head, data, filename = "data", delimitador) {

    let csvData = this.ConvertToCSV(data, head, delimitador);
    let blob = new Blob(["\ufeff" + csvData], {
      type: "text/csv;charset=utf-8;",
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1;
    if (isSafariBrowser) {
      //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  ConvertToCSV(objArray, headerList, delimitador) {
    let array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let str = "";
    let row = "#num" + delimitador;

    for (let index in headerList) {
      row += headerList[index] + delimitador;
    }
    row = row.slice(0, -1);
    str += row + "\r\n";

    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + "";
      for (let index in headerList) {
        let head = headerList[index];
        let texto = array[i][head] + ""
        line += delimitador + texto.replace(/[\r\n]+/gm, "").toUpperCase();
      }
      str += line + "\r\n";
    }
    return str;
  }

  // ==================== VALIDACIONES DE FECHAS ====================

  /**
   * Valida que una fecha tenga formato YYYY-MM-DD
   */
  validarFormatoFecha(fecha: string): boolean {
    if (!fecha) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  }

  /**
   * Valida que fecha_fin sea >= fecha_inicio
   */
  validarRangoFechas(inicio: string, fin: string): boolean {
    if (!inicio || !fin) return false;
    return new Date(inicio) <= new Date(fin);
  }

  /**
   * Valida que una fecha sea futura (mayor a hoy)
   */
  validarFechaFutura(fecha: string): boolean {
    if (!fecha) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(fecha) > hoy;
  }

  /**
   * Valida que una fecha no sea anterior a otra fecha de referencia
   */
  validarFechaNoAnterior(fecha: string, referencia: string): boolean {
    if (!fecha || !referencia) return false;
    return new Date(fecha) >= new Date(referencia);
  }

  /**
   * Valida orden de fechas: emision <= compra <= vencimiento
   */
  validarOrdenFechasInversion(emision: string, compra: string, vencimiento: string): string | null {
    if (!emision || !compra || !vencimiento) return 'Faltan campos de fecha';
    if (!this.validarFormatoFecha(emision)) return 'Fecha de emision con formato invalido';
    if (!this.validarFormatoFecha(compra)) return 'Fecha de compra con formato invalido';
    if (!this.validarFormatoFecha(vencimiento)) return 'Fecha de vencimiento con formato invalido';
    if (new Date(emision) > new Date(compra)) return 'La fecha de emision no puede ser posterior a la fecha de compra';
    if (new Date(compra) > new Date(vencimiento)) return 'La fecha de compra no puede ser posterior a la fecha de vencimiento';
    return null;
  }

  /**
   * Valida que el monto sea un numero positivo
   */
  validarMontoPositivo(valor: any): boolean {
    const num = parseFloat(valor);
    return !isNaN(num) && num > 0;
  }

  /**
   * Valida que el valor sea un numero valido (no NaN)
   */
  esNumeroValido(valor: any): boolean {
    const num = parseFloat(valor);
    return !isNaN(num);
  }
}
