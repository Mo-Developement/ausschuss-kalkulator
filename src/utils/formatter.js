export function formatAG(value) {
    return value ? `AG ${value}` : ""
}

export function formatAGWithMemberNames(id, names) {
    const members = names.map(p => p.substring(0, 3)).join(" ")
    return `${formatAG(id)} [${members}]`
}

export function formatQuotenkriterium(min, max) {
    return min === max
        ? `genau ${min}`
        : `${min} oder ${max}`
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

export function padZero(number) {
    return String(number).padStart(2, '0')
}
