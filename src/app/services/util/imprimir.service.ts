import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ImprimirService {

    createHtmlSectionForPrint(printContents: any) {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
            
            <body>${printContents}</body>
            </html>
        `);

        printWindow.document.head.innerHTML = ` 
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style  type="text/css">
        @media print {
            @page { 
                size: landscape; 
            
            }
            body{ width: 1200px }
            div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Roboto"; font-size:x-small }
            section { 
                page-break-before: always; 
            }
            .mat-drawer-content {height: auto !important; }
            .mat-drawer-container {overflow: inherit !important; }
            .logo { margin-right: 10px; }
            .logo img { max-height: 50px; }
            .cabecera { font-weight: bold; }
            .nombre { font-size:9px; }
            table {
                border-collapse: collapse; width: 100%;         
                th,
                td {
                    padding: .25em .5em;
                    text-align: left;

                    &:nth-child(2) {
                        text-align: left;
                    }
                }

                th {
                    background-color: rgb(122, 122, 206);
                    color: #fff;
                }

                tr {
                    border-bottom: #b9aeae;
                }

                tr:nth-child(odd) {
                    background-color: #f1f1f1;
                }

                tr:nth-child(even) {
                    background-color: #fff;
                }
            }
            th, td { 
                border: 1px solid #ddd;  padding: 8px 16px; text-align: center; 
            }
        }
        
        section { 
            page-break-before: always; 
        }
        .mat-drawer-content {height: auto !important; }
        .mat-drawer-container {overflow: inherit !important; }
        .logo { margin-right: 10px; }
        .logo img { max-height: 50px; }
        .cabecera {font-weight: bold; }
        .nombre { font-size:8px; }
        table {
            border-collapse: collapse; width: 100%;
            font-family: sans-serif;

            th,
            td {
                padding: .25em .5em;
                text-align: left;

                &:nth-child(2) {
                    text-align: left;
                }
            }

            th {
                background-color: rgb(122, 122, 206);
                color: #fff;
            }

            tr {
                border-bottom: #b9aeae;
            }

            tr:nth-child(odd) {
                background-color: #f1f1f1;
            }

            tr:nth-child(even) {
                background-color: #fff;
            }
        }
        th, td { 
            border: 1px solid #ddd; padding: 8px 16px; text-align: center; 
        }
        
        body,div,table,thead,tbody,tfoot,tr,th,td,p { font-family:Calibri; font-size:11px }
        </style>`

        setTimeout( () => {
            printWindow?.document.close();
            printWindow?.print();
            printWindow?.close();
        }, 2000); //2 seconds
        // pero hay un bug, es necesario cambiar el query para que retorna una paginacion 10 of 10 u 100 of 100.
        // TODO cambiar request a paginado.

    }
}
