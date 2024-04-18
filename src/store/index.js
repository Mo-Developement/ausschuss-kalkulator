import { computed, reactive, ref } from "vue"

import { pattAufloesungEnum, sitzStatus } from "./enums.js"
import { formatAG } from "@/utils/formatter.js"

function countOccurences(arr) {
    const countMap = new Map();
    arr.forEach((num) => countMap.set(num, (countMap.get(num) || 0) + 1))
    return countMap
}

function rankDuplicate(countMap) {
    const sorted = [...countMap.keys()].sort((a, b) => b - a)
    
    let rank = 1
    const rankMap = new Map()
    sorted.forEach((num) => {
        rankMap.set(num, rank)
        rank += countMap.get(num)
    })

    return rankMap
}

function newStateInstance() {
    let count = 0

    /**
     * Generiert ein neues Objekt mit den Daten einer Partei
     * @param {string} name - Name der Partei/AG
     * @param {number} sitzeHauptorgan - Anzahl der Sitze im Hauptorgan
     * @param {number|null} [ag=null] - ID der angehörigen Ausschussgemeinschaft
     * @param {number|null} [stimmen=null] - Anzahl der Wählerstimmen
     * @param {string} [agModus="ohneAG"] - Anzeige, ob Objekt für die Berechnung mit oder ohne AGs erstellt wird
     * @param {RefImpl} [original=null] - falls agModus = `mitAG` und selbst keine AG: Referenz auf Objekt ohne AG 
     */
    function neuePartei(name, sitzeHauptorgan, ag=null, stimmen=null, agModus="ohneAG", original=null) {
        const neu = {
            id: count,

            name: ref(name),
            sitzeHauptorgan: ref(sitzeHauptorgan),
            ag: ref(ag),
            stimmen: ref(stimmen),
        }

        neu.proporzgenaueZahlAusschuss = computed(() => neu.sitzeHauptorgan.value / data[agModus].ergebnisse.summeSitzeHauptorgan * startConfig.sitzeAusschuss)
        neu.sicherVertreten = computed(() => neu.proporzgenaueZahlAusschuss.value >= 1 || neu.sitzeHauptorgan.value > (startConfig.sitzeHauptorgan / (1 + startConfig.sitzeAusschuss)))
        neu.agMöglich = computed(() => !(neu.sicherVertreten.value === true || neu.sitzeHauptorgan.value === 0))
        neu.quotenKriterium = computed(() => !Number.isInteger(neu.proporzgenaueZahlAusschuss.value)
            ? Math.floor(neu.proporzgenaueZahlAusschuss.value) + " oder " + Math.ceil(neu.proporzgenaueZahlAusschuss.value)
            : neu.proporzgenaueZahlAusschuss)

        neu.hn = {}
        neu.hn.sitzeGanz = computed(() => Math.floor(neu.proporzgenaueZahlAusschuss.value))
        neu.hn.sitzeRest = computed(() => +(neu.proporzgenaueZahlAusschuss.value - neu.hn.sitzeGanz.value).toFixed(4))
        neu.hn.rangRest = computed(() => data[agModus].helper.hn.raengeRest.get(neu.hn.sitzeRest.value))
        neu.hn.restsitz = computed(() => neu.hn.rangRest.value <= data[agModus].ergebnisse.hn.summeSitzeRest ? 1 : 0)
        neu.hn.patt = computed(() => (neu.hn.restsitz.value === 1) && 
            ((data[agModus].helper.hn.vorkommenRaenge.get(neu.hn.sitzeRest.value) + neu.hn.rangRest.value - 1) > data[agModus].ergebnisse.hn.summeSitzeRest))
        neu.hn.sitze = computed(() => neu.hn.sitzeGanz.value + (neu.hn.patt.value === false ? neu.hn.restsitz.value : 0))
        neu.hn.losChance = computed(() => neu.hn.patt.value === false ? 0 : (startConfig.sitzeAusschuss - data[agModus].ergebnisse.hn.summeSitze) / data[agModus].ergebnisse.hn.summePatt)
        neu.hn.stimmenGelost = computed(() => (neu.hn.patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
            ? neu.stimmen : 0)
        neu.hn.pattgewinn = computed(() => data[agModus].helper.hn.raengeStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data[agModus].ergebnisse.hn.summeSitze))
        neu.hn.pattaufloesung = computed(() => neu.hn.patt.value === false ? 0
            : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
                ? neu.hn.losChance.value
                : +neu.hn.pattgewinn.value))

        if (agModus === "mitAG") {
            neu.hn.sitzeOhneAG = computed(() => original === null ? null: original.hn.pattaufloesung + original.hn.sitze)
            neu.hn.verlustLetzterSitz = computed(() => (neu.hn.sitzeOhneAG.value >= 1) && (neu.hn.sitze.value + neu.hn.pattaufloesung.value) < 1)
        }

        function neuesQuotientenVerfahren(name) {
            neu[name] = {}

            neu[name].quotienten = computed(() => new Map(data[agModus].helper[name].quotienten.map(q => [
                q, neu.sitzeHauptorgan.value / q])))
            neu[name].raenge = computed(() => new Map(data[agModus].helper[name].quotienten.map(q => [q,
                data[agModus].helper[name].raenge.get(neu[name].quotienten.value.get(q))])))
            neu[name].sitze = computed(() => new Map(data[agModus].helper[name].quotienten.map(q => [q,
                neu[name].raenge.value.get(q) <= startConfig.sitzeAusschuss
                    ? (neu[name].raenge.value.get(q) + data[agModus].helper[name].vorkommenQuotienten.get(neu[name].quotienten.value.get(q)) - 1 <= startConfig.sitzeAusschuss
                        ? sitzStatus.SITZ
                        : sitzStatus.PATT)
                    : sitzStatus.LEER])))
            neu[name].sitzeGesamt = computed(() => [...neu[name].sitze.value.values()].filter(value => value === sitzStatus.SITZ).length)
            neu[name].patt = computed(() => [...neu[name].sitze.value.values()].filter(value => value === sitzStatus.PATT).length > 0)
            neu[name].losChance = computed(() => neu[name].patt.value === true
                ? (startConfig.sitzeAusschuss - data[agModus].ergebnisse[name].summeSitzeGesamt) / data[agModus].ergebnisse[name].summePatt
                : 0)
            neu[name].stimmenGelost = computed(() => (neu[name].patt.value === true && (startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)) ? neu.stimmen.value : 0)
            neu[name].pattgewinn = computed(() => data[agModus].helper[name].raengeStimmenGelost.get(neu[name].stimmenGelost.value) <= (startConfig.sitzeAusschuss - data[agModus].ergebnisse[name].summeSitzeGesamt))
            neu[name].pattaufloesung = computed(() => neu[name].patt.value === false ? 0
                : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
                    ? neu[name].losChance.value
                    : +neu[name].pattgewinn.value))
            neu[name].qkVerletzt = computed(() => neu[name].sitzeGesamt.value < Math.floor(neu.proporzgenaueZahlAusschuss.value)
                || neu[name].sitzeGesamt.value + +neu[name].patt.value > Math.ceil(neu.proporzgenaueZahlAusschuss.value))

            if (agModus === "mitAG") {
                neu[name].sitzeOhneAG = computed(() => original === null ? null: original[name].pattaufloesung + original[name].sitzeGesamt)
                neu[name].verlustLetzterSitz = computed(() => (neu[name].sitzeOhneAG.value >= 1) && (neu[name].sitzeGesamt.value + neu[name].pattaufloesung.value) < 1)
            }
        }

        neuesQuotientenVerfahren("sls")
        neuesQuotientenVerfahren("dh")

        count++

        return neu
    }

    const startConfig = reactive({
        sitzeHauptorgan: 0,
        sitzeAusschuss: 0,
        pattAufloesung: '',
    })

    const data = reactive({})
    
    function setupInitialData(agModus, parteien) {
        data[agModus] = {
            parteien: parteien,
            ergebnisse: {
                summeSitzeHauptorgan: computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.sitzeHauptorgan, 0)),
                summeProporzgenaueZahlAusschuss: computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.proporzgenaueZahlAusschuss, 0)),
                summeStimmen: computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.stimmen, 0)),
            },
            helper: {
                maxProporzgenaueZahlAusschuss: computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p.proporzgenaueZahlAusschuss), 0)),
                raengeStimmen: computed(() => rankDuplicate(countOccurences(data[agModus].parteien.map(p => p.stimmen)))),
            }
        }
    }

    function setupHareNiemeyerVerfahren(agModus) {
        data[agModus].ergebnisse.hn = {}
        data[agModus].ergebnisse.hn.summeSitzeGanz = computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.hn.sitzeGanz, 0))
        data[agModus].ergebnisse.hn.summeSitzeRest = computed(() => Math.round(data[agModus].parteien.reduce((sum, p) => sum + +p.hn.sitzeRest, 0)))
        data[agModus].ergebnisse.hn.summePatt = computed(() => data[agModus].parteien.filter(p => p.hn.patt === true).length)
        data[agModus].ergebnisse.hn.summeSitze = computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.hn.sitze, 0))
        data[agModus].ergebnisse.hn.summeLosChance = computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.hn.losChance, 0))
        data[agModus].ergebnisse.hn.summePattaufloesung = computed(() => Math.round(data[agModus].parteien.reduce((sum, p) => sum + p.hn.pattaufloesung, 0)))
        data[agModus].ergebnisse.hn.summeSitzeMitPatt = computed(() => data[agModus].ergebnisse.hn.summeSitze + data[agModus].ergebnisse.hn.summePattaufloesung)

        data[agModus].helper.hn = {}
        data[agModus].helper.hn.maxSitzeGanz = computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p.hn.sitzeGanz), 0))
        data[agModus].helper.hn.vorkommenRaenge = computed(() => countOccurences(data[agModus].parteien.map(p => p.hn.sitzeRest)))
        data[agModus].helper.hn.raengeRest = computed(() => rankDuplicate(data[agModus].helper.hn.vorkommenRaenge))
        data[agModus].helper.hn.summeRestsitzeGesamt = computed(() => data[agModus].parteien.reduce((sum, p) => sum + p.hn.restsitz, 0))
        data[agModus].helper.hn.maxSitze = computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p.hn.sitze), 0))
        data[agModus].helper.hn.raengeStimmen = computed(() => rankDuplicate(countOccurences(data[agModus].parteien.map(p => p.hn.stimmenGelost.value))))
        data[agModus].helper.hn.maxPattaufloesung = computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p.hn.pattaufloesung), 0))
        data[agModus].ergebnisse.hn.summeRestsitze = computed(() => data[agModus].helper.hn.summeRestsitzeGesamt - data[agModus].ergebnisse.hn.summePatt)
    }

    function setupQuotientenVerfahren(agModus, name, quotienten) {
        data[agModus].ergebnisse[name] = {}
        data[agModus].ergebnisse[name].summeSitzeGesamt = computed(() => Math.round(data[agModus].parteien.reduce((sum, p) => sum + p[name].sitzeGesamt, 0)))
        data[agModus].ergebnisse[name].summePatt = computed(() => data[agModus].parteien.filter(p => p[name].patt === true).length)
        data[agModus].ergebnisse[name].summeLosChance = computed(() => data[agModus].parteien.reduce((sum, p) => sum + p[name].losChance, 0))
        data[agModus].ergebnisse[name].summePattaufloesung = computed(() => Math.round(data[agModus].parteien.reduce((sum, p) => sum + p[name].pattaufloesung, 0)))
        data[agModus].ergebnisse[name].summeSitzeMitPatt = computed(() => data[agModus].ergebnisse[name].summePattaufloesung + data[agModus].ergebnisse[name].summeSitzeGesamt)
        data[agModus].ergebnisse[name].summeQkVerletzt = computed(() => data[agModus].parteien.filter(p => p[name].qkVerletzt === true).length)

        data[agModus].helper[name] = {}
        data[agModus].helper[name].quotienten = quotienten
        data[agModus].helper[name].maxSitzeGesamt = computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p[name].sitzeGesamt), 0))
        data[agModus].helper[name].maxPattaufloesung = computed(() => data[agModus].parteien.reduce((max, p) => Math.max(max, p[name].pattaufloesung), 0))
        data[agModus].helper[name].vorkommenQuotienten = computed(() => countOccurences(data[agModus].parteien.reduce((arr, p) => arr.concat(...p[name].quotienten.values()), [])))
        data[agModus].helper[name].raenge = computed(() => rankDuplicate(data[agModus].helper[name].vorkommenQuotienten))
        data[agModus].helper[name].raengeStimmenGelost = computed(() => rankDuplicate(countOccurences(data[agModus].parteien.map(p => p[name].stimmenGelost))))
    }

    const ags = computed(() => {
        const groupedByAgId = Object.groupBy(inputParteien.value.filter(p => p.ag !== null), ({ ag }) => ag)
        return Object.entries(groupedByAgId)
            .toSorted((a, b) => +a[0] - (+b[0]))  // AGs nach Nummer sortieren
            .map(([id, parteien]) => {
                const agNamen = parteien.map(p => p.name.substring(0, 3)).join(" ")
                return neuePartei(
                    `${formatAG(id)} [${agNamen}]`,
                    parteien.reduce((sum, p) => sum + p.sitzeHauptorgan, 0),
                    null,
                    0,
                    "mitAG"
                )
            })
    })

    const inputParteien = ref([])
    const ohneAgViewParteien = computed(() => inputParteien.value)
    const agViewParteien = computed(() => inputParteien.value
        .filter(p => p.ag === null)
        .map(p => reactive(neuePartei(p.name, p.sitzeHauptorgan, p.ag, p.stimmen, "mitAG", p)))
        .concat(reactive(ags.value)))

    for (const agModus of ["ohneAG", "mitAG"]) {
        const parteien = agModus === "ohneAG" ? ohneAgViewParteien : agViewParteien

        setupInitialData(agModus, parteien)
        setupHareNiemeyerVerfahren(agModus)
        setupQuotientenVerfahren(agModus, "sls", Array.from({ length: 19 }, (_, i) => i * 2 + 1))
        setupQuotientenVerfahren(agModus, "dh", Array.from({ length: 19 }, (_, i) => i + 1))
    }

    function deleteItem(id) {
        const idx = inputParteien.value.findIndex(item => item.id === id)
        inputParteien.value.splice(idx, 1)
    }

    function updateItem(partei) {
        const idx = inputParteien.value.findIndex(item => item.id === partei.id)
        if (idx === -1) {
            inputParteien.value.push(partei)
        } else {
            inputParteien.value.splice(idx, 1, partei)
        }
    }

    function clear() {
        startConfig.sitzeHauptorgan = 0
        startConfig.sitzeAusschuss = 0
        startConfig.pattAufloesung = pattAufloesungEnum.LOS.value

        inputParteien.value.splice(0)
    }

    function loadDefaults() {
        clear()

        startConfig.sitzeHauptorgan = 70
        startConfig.sitzeAusschuss = 14 // 8 für SLS
        startConfig.pattAufloesung = pattAufloesungEnum.STIMMEN.value

        inputParteien.value.push(
            neuePartei("CSU", 20, null, 6543),
            neuePartei("GRÜNE", 16, null, 5432), // 20 für SL/S
            neuePartei("FREIE WÄHLER", 10, null, 4321),
            neuePartei("SPD", 8, null, 3210),
            neuePartei("AfD", 4, null, 2345),
            neuePartei("FDP", 3, 2, 1234),
            neuePartei("LINKE", 2, 2, 1111),
            neuePartei("ÖDP", 2, 1, 1000),
            neuePartei("Bayernpartei", 2, 2, 211),
            neuePartei("FRANKEN", 2, 1, 987),
            neuePartei("Tierschutzpartei", 1, 1, 182)
        )
    }

    return {
        data,
        startConfig,

        clear,
        loadDefaults,

        neuePartei,
        updateItem,
        deleteItem
    }
}

const globalState = newStateInstance()

export function useState() {
    return globalState
}
