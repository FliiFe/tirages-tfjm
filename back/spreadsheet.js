import Excel from 'exceljs'

export default function spreadSheetFromResults(results) {
    const spreadSheet = new Excel.Workbook()
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    results.poulesConfig.forEach((n, i) => {
        const poule = i + 1
        const worksheet = spreadSheet.addWorksheet(`Poule ${poule}`)
        worksheet.mergeCells('A1:B1')
        worksheet.getCell('A1').value = 'Nombre tiré'
        worksheet.getCell('A1').alignment = { horizontal: 'center' }
        worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'lightGray'
        }
        const cols = [{ width: 10 }]
        for (let p = 1; p <= results.problemes; p++) cols.push({ width: 5 })
        worksheet.columns = cols
        results.poules[i].forEach((team, ind) => {
            worksheet.getCell(`A${ind + 2}`).value = team
            worksheet.getCell(`A${ind + 2}`).alignment = { horizontal: 'center' }
            worksheet.getCell(`B${ind + 2}`).value = results.poulesValue.find(e => e.name === team).randnum
            worksheet.getCell(`B${ind + 2}`).alignment = { horizontal: 'center' }
        })

        worksheet.getCell(`A${n + 2 + 1}`).value = 'Équipe'
        worksheet.getCell(`A${n + 2 + 1}`).alignment = { horizontal: 'center' }
        worksheet.getCell(`A${n + 2 + 1}`).fill = {
            type: 'pattern',
            pattern: 'lightGray'
        }
        for (let p = 1; p <= results.problemes; p++) {
            worksheet.getCell(`${alphabet[p]}${n + 2 + 1}`).value = 'P' + p
            worksheet.getCell(`${alphabet[p]}${n + 2 + 1}`).fill = {
                type: 'pattern',
                pattern: 'lightGray'
            }
            worksheet.getCell(`${alphabet[p]}${n + 2 + 1}`).alignment = { horizontal: 'center' }
        }
        results.tirages[i + 1].pb.forEach((obj, ind) => {
            worksheet.getCell(`A${n + 2 + 2 + ind}`).value = obj.name
            worksheet.getCell(`A${n + 2 + 2 + ind}`).alignment = { horizontal: 'center' }
            for (let p = 1; p <= results.problemes; p++) {
                let val = obj[`p${p}`]
                worksheet.getCell(`${alphabet[p]}${n + 2 + 2 + ind}`).value = obj[`p${p}`]
                worksheet.getCell(`${alphabet[p]}${n + 2 + 2 + ind}`).alignment = { horizontal: 'center' }
                if (val > 0) {
                    worksheet.getCell(`${alphabet[p]}${n + 2 + 2 + ind}`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF42FF68' }
                    }
                } else if (val < 0) {
                    worksheet.getCell(`${alphabet[p]}${n + 2 + 2 + ind}`).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF4141' }
                    }
                }
            }
        })
    })
    return spreadSheet
}
