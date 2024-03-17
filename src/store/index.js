import { computed, reactive, ref } from "vue"
import { pattAufloesungEnum, sitzStatus } from "./enums"

let count = 0

function countOccurences(arr) {
    const countMap = new Map();
    arr.forEach((num) => {
        countMap.set(num, (countMap.get(num) || 0) + 1);
    });
    return countMap

    // const myArray = [false, 24, "English", false, "english", 22, 19, false, "English", 19];

    // let countObject = myArray.reduce(function (
    //     count,
    //     currentValue
    // ) {
    //     return (
    //         count[currentValue] ? ++count[currentValue] : (count[currentValue] = 1),
    //         count
    //     );
    // },
    // {});
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
    neu.hN.rangRest = computed(() => data.helper.raengeHNRest.get(neu.hN.sitzeRest.value))
    neu.hN.restsitz = computed(() => neu.hN.rangRest.value <= data.ergebnisse.summeHNSitzeRest ? 1 : 0)
    neu.hN.patt = computed(() => (neu.hN.restsitz.value === 1) && 
        ((data.helper.vorkommenHNRaenge.get(neu.hN.sitzeRest.value) + neu.hN.rangRest.value - 1) > data.ergebnisse.summeHNSitzeRest))
    neu.hN.sitze = computed(() => neu.hN.sitzeGanz.value + (neu.hN.patt.value === false ? neu.hN.restsitz.value : 0))
    neu.hN.losChance = computed(() => neu.hN.patt.value === false ? 0 : (startConfig.sitzeAusschuss - data.ergebnisse.summeHNSitze) / data.ergebnisse.summeHNPatt)
    neu.hN.stimmenGelost = computed(() => (neu.hN.patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
        ? neu.stimmen : 0)
    neu.hN.pattgewinn = computed(() => data.helper.raengeHNStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data.ergebnisse.summeHNSitze))
    neu.hN.pattaufloesung = computed(() => neu.hN.patt.value === false ? 0
        : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
            ? neu.hN.losChance.value
            : +neu.hN.pattgewinn.value))

    neu.sls = {}
    neu.sls.quotienten = computed(() => new Map(data.helper.slsQuotienten.map(q => [
        q, neu.sitzeHauptorgan.value / q])))
    neu.sls.raenge = computed(() => new Map(data.helper.slsQuotienten.map(q => [q,
        data.helper.slsRaenge.get(neu.sls.quotienten.value.get(q))])))
    neu.sls.sitze = computed(() => new Map(data.helper.slsQuotienten.map(q => [q,
        neu.sls.raenge.value.get(q) <= startConfig.sitzeAusschuss
            ? (neu.sls.raenge.value.get(q) + data.helper.slsVorkommenQuotienten.get(neu.sls.quotienten.value.get(q)) - 1 <= startConfig.sitzeAusschuss
                ? sitzStatus.SITZ
                : sitzStatus.PATT)
            : sitzStatus.LEER])))
    neu.sls.sitzeGesamt = computed(() => [...neu.sls.sitze.value.values()].filter(v => v === sitzStatus.SITZ).length)
    neu.sls.patt = computed(() => [...neu.sls.sitze.value.values()].filter(v => v === sitzStatus.PATT).length > 0)
    neu.sls.losChance = computed(() => neu.sls.patt.value === true
        ? (startConfig.sitzeAusschuss - data.ergebnisse.summeSLSSitzeGesamt) / data.ergebnisse.summeSLSPatt
        : 0)
    neu.sls.stimmenGelost = computed(() => (neu.sls.patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
        ? neu.stimmen : 0)
    neu.sls.pattgewinn = computed(() => data.helper.raengeStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data.ergebnisse.summeSLSSitzeGesamt))
    neu.sls.pattaufloesung = computed(() => neu.sls.patt.value === false ? 0
        : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
            ? neu.sls.losChance.value
            : +neu.sls.pattgewinn.value))
    neu.sls.qkVerletzt = computed(() => neu.sls.sitzeGesamt.value < Math.floor(neu.proporzgenaueZahlAusschuss.value)
        || neu.sls.sitzeGesamt.value + +neu.sls.patt.value > Math.ceil(neu.proporzgenaueZahlAusschuss.value))

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

        summeHNSitzeGanz: computed(() => parteien.value.reduce((sum, p) => sum + p.hN.sitzeGanz, 0)),
        summeHNSitzeRest: computed(() => Math.round(parteien.value.reduce((sum, p) => sum + +p.hN.sitzeRest, 0))),
        summeHNPatt: computed(() => parteien.value.filter(p => p.hN.patt === true).length),
        summeHNSitze: computed(() => parteien.value.reduce((sum, p) => sum + p.hN.sitze, 0)),
        summeHNLosChance: computed(() => parteien.value.reduce((sum, p) => sum + p.hN.losChance, 0)),
        summeHNPattaufloesung: computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p.hN.pattaufloesung, 0))),

        summeSLSSitzeGesamt: computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p.sls.sitzeGesamt, 0))),
        summeSLSPatt: computed(() => parteien.value.filter(p => p.sls.patt === true).length),
        summeSLSLosChance: computed(() => parteien.value.reduce((sum, p) => sum + p.sls.losChance, 0)),
        summeSLSPattaufloesung: computed(() => parteien.value.reduce((sum, p) => sum + p.sls.pattaufloesung, 0)),
        summeSLSQkVerletzt: computed(() => parteien.value.filter(p => p.sls.qkVerletzt === true).length),
    },
    helper: {
        maxProporzgenaueZahlAusschuss: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.proporzgenaueZahlAusschuss), 0)),
        raengeStimmen: computed(() => rankDuplicate(countOccurences(parteien.value.map(p => p.stimmen)))),
        
        maxHNSitzeGanz: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.sitzeGanz), 0)),
        vorkommenHNRaenge: computed(() => countOccurences(parteien.value.map(p => p.hN.sitzeRest))),
        summeHNRestsitzeGesamt: computed(() => parteien.value.reduce((sum, p) => sum + p.hN.restsitz, 0)),
        maxHNSitze: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.sitze), 0)),
        raengeHNStimmen: computed(() => rankDuplicate(countOccurences(parteien.value.map(p => p.hN.stimmenGelost.value)))),
        maxHNPattaufloesung: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hN.pattaufloesung), 0)),
        
        slsQuotienten: Array.from({ length: 19 }, (_, i) => i * 2 + 1),
        slsMaxSitzeGesamt: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.sls.sitzeGesamt), 0)),
        slsMaxPattaufloesung: computed(() => parteien.value.reduce((max, p) => Math.max(max, p.sls.pattaufloesung), 0)),
    }
})

data.helper.raengeHNRest = computed(() => rankDuplicate(data.helper.vorkommenHNRaenge))
data.ergebnisse.summeHNRestsitze = computed(() => data.helper.summeHNRestsitzeGesamt - data.ergebnisse.summeHNPatt)

data.helper.slsVorkommenQuotienten = computed(() => countOccurences(parteien.value.reduce((arr, p) => arr.concat(...p.sls.quotienten.values()), [])))
data.helper.slsRaenge = computed(() => rankDuplicate(data.helper.slsVorkommenQuotienten))

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
