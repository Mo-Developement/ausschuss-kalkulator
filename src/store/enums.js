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

export const verfahren = Object.freeze({
    D_HONDT:        { dataKey: "dh", name: "d'Hondt" },
    HARE_NIEMEYER:  { dataKey: "hn", name: "Hare/Niemeyer" },
    LAGUE_SCHEPERS: { dataKey: "sls", name: "Sainte-Laguë/Schepers" }
})

export const agTabs = Object.freeze([
    { label: "ohne AG", icon: "pi pi-user" },
    { label: "mit AG", icon: "pi pi-users" }
])
