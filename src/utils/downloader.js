import { saveAs } from "file-saver"

import { padZero } from "./formatter.js"

export function download(dataObject) {
    const now = new Date(Date.now())
    const timestamp = `${now.getFullYear()}-${padZero(now.getMonth()+1)}-${padZero(now.getDate())}_` +
        `${now.getHours()}-${padZero(now.getMinutes())}-${padZero(now.getSeconds())}`
    const filename = "ausschuss-kalkulator_" + timestamp + ".json"

    const fullData = { version: process.env.PROJECT_VERSION, ...dataObject }
    const json = JSON.stringify(fullData, null, 4)

    const blob = new Blob([json], { type: "application/json" })
    saveAs(blob, filename)
}
