export function formatAG(value) {
    return value ? `AG ${value}` : ""
}

export function formatYesNo(value) {
    return value === true ? "ja" : "nein"
}

export function formatOkNok(value) {
    return value === true ? "OK" : "NOK"
}

export function formatDecimal(value, precision) {
    return value.toFixed(precision).replace(/\./g, ",")
}

export function formatPercent(value) {
    return Math.round(value * 100) + " %"
}

export function formatRank(value) {
    return value + "."
}
