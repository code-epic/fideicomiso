import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ImprimirService {

    createHtmlSectionForPrint(printContents: any, i: number = 0, xsize : string = '') {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
            <html>
            
            <body>${printContents}</body>
            </html>
        `);

        if (i === 0) {
            printWindow.document.head.innerHTML = ` 
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
            <style  type="text/css">
            @media print {
                @page { 
                    ${xsize} 
                
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
                        background-color:rgb(228, 228, 228);
                        color: #252525;
                        text-align: center;
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
                    background-color: #F5F5F0;
                    color: #252525;
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
        } else {

            printWindow.document.head.innerHTML = ` 
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
            <style  type="text/css">
                @media print {
                    @page { 
                        size: landscape; 
                    
                    }
            table{
                border-collapse: collapse;
                font-size: 10.5px;
                width: 100%;
            }
            
            div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Roboto"; font-size:x-small }

            .titulo th {
                border: 1px solid black;
            }
            
            .cabecera th {
                border: 1px solid black;
                text-align: center;
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            tr td {
                border: 1px solid black;
                text-align: center;
            }
            
            
            td, th{
                padding: 0.5rem;
            }
            
            .right {
                text-align: right;
            }
            
            .bgblue {
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            .none {
                border:none ;
            }
            
            .linea {
                background-color: rgb(255, 255, 255);
            }
            
            .yellow {
            background-color: rgb(97, 97, 75);
            }
        }

        table{
                border-collapse: collapse;
                font-size: 10.5px;
                width: 100%;
            }
            
            div,table,thead,tbody,tfoot,tr,th,td,p { font-family:"Roboto"; font-size:x-small }

            .titulo th {
                border: 1px solid black;
            }
            
            .cabecera th {
                border: 1px solid black;
                text-align: center;
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            tr td {
                border: 1px solid black;
                text-align: center;
            }
            
            
            td, th{
                padding: 0.5rem;
            }
            
            .right {
                text-align: right;
            }
            
            .bgblue {
                background-color: rgb(182, 167, 167);
                color: white;
            }
            
            .none {
                border:none ;
            }
            
            .linea {
                background-color: rgb(255, 255, 255);
            }
            
            .yellow {
            background-color: rgb(97, 97, 75);
            }
            `
        }

        setTimeout(() => {
            printWindow?.document.close();
            printWindow?.print();
            printWindow?.close();
        }, 1000); //1 second

    }
}
