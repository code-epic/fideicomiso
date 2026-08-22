import { Inject, Injectable } from '@angular/core';


@Injectable({
    providedIn: 'root'
})
export class ImprimirService {

    createHtmlSectionForPrint(printContents: any, i: number = 0, xsize : string = '') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let headContent = '';
        if (i === 0) {
            headContent = ` 
            <base href="${window.location.origin}/">
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style type="text/css">
            @page { 
                size: letter portrait;
                margin: 10mm 12mm;
            }
            @media print {
                body { padding: 0 !important; margin: 0 !important; }
                div, table, thead, tbody, tfoot, tr, th, td, p { font-family: 'IBM Plex Sans', sans-serif; }
                table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
                tr { page-break-inside: auto; }
                th, td { padding: 10px 16px; }
            }

            body { 
                font-family: 'IBM Plex Sans', sans-serif;
                font-size: 13px;
                line-height: 1.5;
                color: #0F172A;
                margin: 0;
                padding: 0;
            }

            table { 
                width: 100%; 
                border-collapse: collapse;
            }

            th, td { 
                padding: 10px 16px; 
            }
            </style>`;
        } else {
            headContent = ` 
            <base href="${window.location.origin}/">
            <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style type="text/css">
                @media print {
                    @page { 
                        size: landscape; 
                        margin: 10mm;
                    }
                    table {
                        border-collapse: collapse;
                        font-size: 10.5px;
                        width: 100%;
                    }
                }

                @page { 
                    size: landscape; 
                    margin: 10mm;
                }

                body { 
                    font-family: 'IBM Plex Sans', sans-serif;
                    font-size: 11px;
                    line-height: 1.4;
                    color: #0F172A;
                    margin: 0;
                    padding: 0;
                }

                table {
                    border-collapse: collapse;
                    font-size: 10.5px;
                    width: 100%;
                    page-break-inside: auto;
                }
                tr { page-break-inside: auto; }

                .titulo th { border-bottom: 1px solid #ccc; }
                .cabecera th { 
                    text-align: center; 
                    background-color: #eeeee4; 
                    color: #0F172A; 
                    font-weight: 600; 
                    border-bottom: 2px solid #1a237e; 
                    padding: 6px 8px;
                }
                tr td { text-align: center; border-bottom: 1px solid #e5e7eb; padding: 5px 8px; }
                td, th { padding: 5px 8px; }
                .right { text-align: right; }
                .bgblue { background-color: #eeeee4; color: #0F172A; font-weight: 600; }
                .none { border: none; }
                .linea { background-color: #ffffff; }
                .yellow { background-color: #eeeee4; }
            </style>`;
        }

        printWindow.document.write(`
            <html>
            <head>
                ${headContent}
            </head>
            <body>${printContents}</body>
            </html>
        `);

        const triggerPrint = () => {
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        const images = printWindow.document.querySelectorAll('img');
        if (images.length > 0) {
            let loadedCount = 0;
            const onImageLoaded = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setTimeout(triggerPrint, 300);
                }
            };
            images.forEach((img: any) => {
                if (img.complete) {
                    onImageLoaded();
                } else {
                    img.onload = onImageLoaded;
                    img.onerror = onImageLoaded;
                }
            });
            setTimeout(triggerPrint, 2500); // Fallback timeout
        } else {
            setTimeout(triggerPrint, 500);
        }
    }
}
