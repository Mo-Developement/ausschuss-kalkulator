function SelectItem(value, display) {
    this.value = value;
    this.display = display;
}

export const pattAufloesungEnum = Object.freeze({
    LOS: new SelectItem("los", "Los-Chance"),
    STIMMEN: new SelectItem("stimmen", "Stimmen")
})

export const agEnum = Object.freeze({
    AG_1: new SelectItem("ag1", "AG 1"),
    AG_2: new SelectItem("ag2", "AG 2"),
    AG_3: new SelectItem("ag3", "AG 3"),
    AG_4: new SelectItem("ag4", "AG 4")
})

export const sitzStatus = Object.freeze({
    SITZ: "SITZ",
    PATT: "PATT",
    LEER: ""
})
