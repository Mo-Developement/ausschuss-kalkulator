function SelectItem(value, display) {
    this.value = value;
    this.display = display;
}

export const pattAufloesungEnum = Object.freeze({
    LOS: new SelectItem("los", "Los-Chance"),
    STIMMEN: new SelectItem("stimmen", "Stimmen")
})

export const sitzStatus = Object.freeze({
    SITZ: "SITZ",
    PATT: "PATT",
    LEER: ""
})

export const quotientenVerfahrenTabelle = Object.freeze([
    { dataKey: "sls", name: "Sainte-Laguë/<wbr>Schepers" },
    { dataKey: "dh", name: "d'Hondt" }
])
