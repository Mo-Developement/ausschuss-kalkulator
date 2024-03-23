import { computed, reactive, ref } from "vue"
import { pattAufloesungEnum, sitzStatus } from "./enums"

let count = 0

function countOccurences(arr) {
    const countMap = new Map();
    arr.forEach((num) => {
        countMap.set(num, (countMap.get(num) || 0) + 1);
    });
    return countMap
}

function rankDuplicate(countMap) {
    // Sort unique elements in descending order
    const sorted = [...countMap.keys()].sort((a, b) => b - a);
    
    // Assign ranks taking into account duplicate values
    let rank = 1;
    const rankMap = new Map();
    sorted.forEach((num) => {
        rankMap.set(num, rank);
        rank += countMap.get(num);
    });
  
    // Map original array elements to their ranks
    return rankMap
}  

export function neuePartei(name, sitzeHauptorganN, ag='', stimmen=undefined) {
    const neu = {
        id: count,

        name: ref(name),
        sitzeHauptorgan: ref(sitzeHauptorganN),
        ag: ref(ag),
        stimmen: ref(stimmen),
    }

    neu.proporzgenaueZahlAusschuss = computed(() => neu.sitzeHauptorgan.value / data.ergebnisse.summeSitzeHauptorgan * startConfig.sitzeAusschuss)
    neu.sicherVertreten = computed(() => neu.proporzgenaueZahlAusschuss.value >= 1 || neu.sitzeHauptorgan.value > (startConfig.sitzeHauptorgan / (1 + startConfig.sitzeAusschuss)))
    neu.quotenKriterium = computed(() => !Number.isInteger(neu.proporzgenaueZahlAusschuss.value)
        ? Math.floor(neu.proporzgenaueZahlAusschuss.value) + " oder " + Math.ceil(neu.proporzgenaueZahlAusschuss.value)
        : neu.proporzgenaueZahlAusschuss)

    neu.hN = {}
    neu.hN.sitzeGanz = computed(() => Math.floor(neu.proporzgenaueZahlAusschuss.value))
    neu.hN.sitzeRest = computed(() => +(neu.proporzgenaueZahlAusschuss.value - neu.hN.sitzeGanz.value).toFixed(4))
    neu.hN.rangRest = computed(() => data.helper.hn.raengeRest.get(neu.hN.sitzeRest.value))
    neu.hN.restsitz = computed(() => neu.hN.rangRest.value <= data.ergebnisse.hn.summeSitzeRest ? 1 : 0)
    neu.hN.patt = computed(() => (neu.hN.restsitz.value === 1) && 
        ((data.helper.hn.vorkommenRaenge.get(neu.hN.sitzeRest.value) + neu.hN.rangRest.value - 1) > data.ergebnisse.hn.summeSitzeRest))
    neu.hN.sitze = computed(() => neu.hN.sitzeGanz.value + (neu.hN.patt.value === false ? neu.hN.restsitz.value : 0))
    neu.hN.losChance = computed(() => neu.hN.patt.value === false ? 0 : (startConfig.sitzeAusschuss - data.ergebnisse.hn.summeSitze) / data.ergebnisse.hn.summePatt)
    neu.hN.stimmenGelost = computed(() => (neu.hN.patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
        ? neu.stimmen : 0)
    neu.hN.pattgewinn = computed(() => data.helper.hn.raengeStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data.ergebnisse.hn.summeSitze))
    neu.hN.pattaufloesung = computed(() => neu.hN.patt.value === false ? 0
        : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
            ? neu.hN.losChance.value
            : +neu.hN.pattgewinn.value))

    function neuesQuotientenVerfahren(name) {
        neu[name] = {}

        neu[name].quotienten = computed(() => new Map(data.helper[name].quotienten.map(q => [
            q, neu.sitzeHauptorgan.value / q])))
        neu[name].raenge = computed(() => new Map(data.helper[name].quotienten.map(q => [q,
            data.helper[name].raenge.get(neu[name].quotienten.value.get(q))])))
        neu[name].sitze = computed(() => new Map(data.helper[name].quotienten.map(q => [q,
            neu[name].raenge.value.get(q) <= startConfig.sitzeAusschuss
                ? (neu[name].raenge.value.get(q) + data.helper[name].vorkommenQuotienten.get(neu[name].quotienten.value.get(q)) - 1 <= startConfig.sitzeAusschuss
                    ? sitzStatus.SITZ
                    : sitzStatus.PATT)
                : sitzStatus.LEER])))
        neu[name].sitzeGesamt = computed(() => [...neu[name].sitze.value.values()].filter(value => value === sitzStatus.SITZ).length)
        neu[name].patt = computed(() => [...neu[name].sitze.value.values()].filter(value => value === sitzStatus.PATT).length > 0)
        neu[name].losChance = computed(() => neu[name].patt.value === true
            ? (startConfig.sitzeAusschuss - data.ergebnisse[name].summeSitzeGesamt) / data.ergebnisse[name].summePatt
            : 0)
        neu[name].stimmenGelost = computed(() => (neu[name].patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
            ? neu.stimmen : 0)
        neu[name].pattgewinn = computed(() => data.helper.raengeStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data.ergebnisse[name].summeSitzeGesamt))
        neu[name].pattaufloesung = computed(() => neu[name].patt.value === false ? 0
            : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
                ? neu[name].losChance.value
                : +neu[name].pattgewinn.value))
        neu[name].qkVerletzt = computed(() => neu[name].sitzeGesamt.value < Math.floor(neu.proporzgenaueZahlAusschuss.value)
            || neu[name].sitzeGesamt.value + +neu[name].patt.value > Math.ceil(neu.proporzgenaueZahlAusschuss.value))
    }

    neuesQuotientenVerfahren("sls")

    count++

    return neu
}

const parteien = ref([])

export const startConfig = reactive({
    sitzeHauptorgan: 0,
    sitzeAusschuss: 0,
    pattAufloesung: '',
})

export const data = reactive({
    parteien,
    ergebnisse: {
        summeSitzeHauptorgan: computed(() => parteien.value.reduce((sum, p) => sum + p.sitzeHauptorgan, 0)),
        summeProporzgenaueZahlAusschuss: computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p.proporzgenaueZahlAusschuss, 0))),
    },
    helper: {
        maxProporzgenaueZahlAusschuss: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.proporzgenaueZahlAusschuss), 0)),
        raengeStimmen: computed(() => rankDuplicate(countOccurences(parteien.value.map(p => p.stimmen)))),
    }
})


function setupHareNiemeyerVerfahren() {
    data.ergebnisse.hn = {}
    data.ergebnisse.hn.summeSitzeGanz = computed(() => parteien.value.reduce((sum, p) => sum + p.hN.sitzeGanz, 0))
    data.ergebnisse.hn.summeSitzeRest = computed(() => Math.round(parteien.value.reduce((sum, p) => sum + +p.hN.sitzeRest, 0)))
    data.ergebnisse.hn.summePatt = computed(() => parteien.value.filter(p => p.hN.patt === true).length)
    data.ergebnisse.hn.summeSitze = computed(() => parteien.value.reduce((sum, p) => sum + p.hN.sitze, 0))
    data.ergebnisse.hn.summeLosChance = computed(() => parteien.value.reduce((sum, p) => sum + p.hN.losChance, 0))
    data.ergebnisse.hn.summePattaufloesung = computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p.hN.pattaufloesung, 0)))

    data.helper.hn = {}
    data.helper.hn.maxSitzeGanz = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.sitzeGanz), 0))
    data.helper.hn.vorkommenRaenge = computed(() => countOccurences(parteien.value.map(p => p.hN.sitzeRest)))
    data.helper.hn.raengeRest = computed(() => rankDuplicate(data.helper.hn.vorkommenRaenge))
    data.helper.hn.summeRestsitzeGesamt = computed(() => parteien.value.reduce((sum, p) => sum + p.hN.restsitz, 0))
    data.helper.hn.maxSitze = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.sitze), 0))
    data.helper.hn.raengeStimmen = computed(() => rankDuplicate(countOccurences(parteien.value.map(p => p.hN.stimmenGelost.value))))
    data.helper.hn.maxPattaufloesung = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.pattaufloesung), 0))
    data.ergebnisse.summeRestsitze = computed(() => data.helper.hn.summeRestsitzeGesamt - data.ergebnisse.hn.summePatt)
}

function setupQuotientenVerfahren(name, quotienten) {
    data.ergebnisse[name] = {}
    data.ergebnisse[name].summeSitzeGesamt = computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p[name].sitzeGesamt, 0)))
    data.ergebnisse[name].summePatt = computed(() => parteien.value.filter(p => p[name].patt === true).length)
    data.ergebnisse[name].summeLosChance = computed(() => parteien.value.reduce((sum, p) => sum + p[name].losChance, 0))
    data.ergebnisse[name].summePattaufloesung = computed(() => parteien.value.reduce((sum, p) => sum + p[name].pattaufloesung, 0))
    data.ergebnisse[name].summeQkVerletzt = computed(() => parteien.value.filter(p => p[name].qkVerletzt === true).length)

    data.helper[name] = {}
    data.helper[name].quotienten = quotienten
    data.helper[name].maxSitzeGesamt = computed(() => parteien.value.reduce((max, p) => Math.max(max, p[name].sitzeGesamt), 0))
    data.helper[name].maxPattaufloesung = computed(() => parteien.value.reduce((max, p) => Math.max(max, p[name].pattaufloesung), 0))
    data.helper[name].vorkommenQuotienten = computed(() => countOccurences(parteien.value.reduce((arr, p) => arr.concat(...p[name].quotienten.values()), [])))
    data.helper[name].raenge = computed(() => rankDuplicate(data.helper[name].vorkommenQuotienten))
}

setupHareNiemeyerVerfahren()
setupQuotientenVerfahren("sls", Array.from({ length: 19 }, (_, i) => i * 2 + 1))

export function deleteItem(id) {
    const idx = data.parteien.findIndex(item => item.id === id)
    data.parteien.splice(idx, 1)
}

export function addItem(partei = neuePartei("Test", 123)) {
    data.parteien.push(partei)
}

export function clear() {
    startConfig.sitzeHauptorgan = 0
    startConfig.sitzeAusschuss = 0
    startConfig.pattAufloesung = ""

    parteien.value.splice(0)
}

export function loadDefaults() {
    clear()

    startConfig.sitzeHauptorgan = 70
    startConfig.sitzeAusschuss = 14 // 8 für SLS
    startConfig.pattAufloesung = pattAufloesungEnum.STIMMEN.value

    data.parteien.push(neuePartei("CSU", 20, "", 6543))
    data.parteien.push(neuePartei("GRÜNE", 16, "", 5432)) // 20 für SLS
    data.parteien.push(neuePartei("FREIE WÄHLER", 10, "", 4321))
    data.parteien.push(neuePartei("SPD", 8, "", 3210))
    data.parteien.push(neuePartei("AfD", 4, "", 2345))
    data.parteien.push(neuePartei("FDP", 3, "", 1234))
    data.parteien.push(neuePartei("LINKE", 2, "", 1111))
    data.parteien.push(neuePartei("ÖDP", 2, "", 1000))
    data.parteien.push(neuePartei("Bayernpartei", 2, "", 211))
    data.parteien.push(neuePartei("FRANKEN", 2, "", 987))
    data.parteien.push(neuePartei("Tierschutzpartei", 1, "", 182))
}
