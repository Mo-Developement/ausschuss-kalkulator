import { computed, reactive, ref } from "vue"
import { agEnum, pattAufloesungEnum, sitzStatus } from "./enums"

function countOccurences(arr) {
    const countMap = new Map();
    arr.forEach((num) => {
        countMap.set(num, (countMap.get(num) || 0) + 1);
    });
    return countMap
}

function rankDuplicate(countMap) {
    const sorted = [...countMap.keys()].sort((a, b) => b - a);
    
    let rank = 1;
    const rankMap = new Map();
    sorted.forEach((num) => {
        rankMap.set(num, rank);
        rank += countMap.get(num);
    });
  
    return rankMap
}

function newStateInstance() {
    let count = 0

    function neuePartei(name, sitzeHauptorganN, ag='', stimmen=undefined) {
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

        neu.hn = {}
        neu.hn.sitzeGanz = computed(() => Math.floor(neu.proporzgenaueZahlAusschuss.value))
        neu.hn.sitzeRest = computed(() => +(neu.proporzgenaueZahlAusschuss.value - neu.hn.sitzeGanz.value).toFixed(4))
        neu.hn.rangRest = computed(() => data.helper.hn.raengeRest.get(neu.hn.sitzeRest.value))
        neu.hn.restsitz = computed(() => neu.hn.rangRest.value <= data.ergebnisse.hn.summeSitzeRest ? 1 : 0)
        neu.hn.patt = computed(() => (neu.hn.restsitz.value === 1) && 
            ((data.helper.hn.vorkommenRaenge.get(neu.hn.sitzeRest.value) + neu.hn.rangRest.value - 1) > data.ergebnisse.hn.summeSitzeRest))
        neu.hn.sitze = computed(() => neu.hn.sitzeGanz.value + (neu.hn.patt.value === false ? neu.hn.restsitz.value : 0))
        neu.hn.losChance = computed(() => neu.hn.patt.value === false ? 0 : (startConfig.sitzeAusschuss - data.ergebnisse.hn.summeSitze) / data.ergebnisse.hn.summePatt)
        neu.hn.stimmenGelost = computed(() => (neu.hn.patt.value === true && startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value)
            ? neu.stimmen : 0)
        neu.hn.pattgewinn = computed(() => data.helper.hn.raengeStimmen.get(neu.stimmen.value) <= (startConfig.sitzeAusschuss - data.ergebnisse.hn.summeSitze))
        neu.hn.pattaufloesung = computed(() => neu.hn.patt.value === false ? 0
            : (startConfig.pattAufloesung === pattAufloesungEnum.LOS.value
                ? neu.hn.losChance.value
                : +neu.hn.pattgewinn.value))

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
        neuesQuotientenVerfahren("dh")

        count++

        return neu
    }

    const parteien = ref([])

    const startConfig = reactive({
        sitzeHauptorgan: 0,
        sitzeAusschuss: 0,
        pattAufloesung: '',
    })

    const data = reactive({
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
        data.ergebnisse.hn.summeSitzeGanz = computed(() => parteien.value.reduce((sum, p) => sum + p.hn.sitzeGanz, 0))
        data.ergebnisse.hn.summeSitzeRest = computed(() => Math.round(parteien.value.reduce((sum, p) => sum + +p.hn.sitzeRest, 0)))
        data.ergebnisse.hn.summePatt = computed(() => parteien.value.filter(p => p.hn.patt === true).length)
        data.ergebnisse.hn.summeSitze = computed(() => parteien.value.reduce((sum, p) => sum + p.hn.sitze, 0))
        data.ergebnisse.hn.summeLosChance = computed(() => parteien.value.reduce((sum, p) => sum + p.hn.losChance, 0))
        data.ergebnisse.hn.summePattaufloesung = computed(() => Math.round(parteien.value.reduce((sum, p) => sum + p.hn.pattaufloesung, 0)))

        data.helper.hn = {}
        data.helper.hn.maxSitzeGanz = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hn.sitzeGanz), 0))
        data.helper.hn.vorkommenRaenge = computed(() => countOccurences(parteien.value.map(p => p.hn.sitzeRest)))
        data.helper.hn.raengeRest = computed(() => rankDuplicate(data.helper.hn.vorkommenRaenge))
        data.helper.hn.summeRestsitzeGesamt = computed(() => parteien.value.reduce((sum, p) => sum + p.hn.restsitz, 0))
        data.helper.hn.maxSitze = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hn.sitze), 0))
        data.helper.hn.raengeStimmen = computed(() => rankDuplicate(countOccurences(parteien.value.map(p => p.hn.stimmenGelost.value))))
        data.helper.hn.maxPattaufloesung = computed(() => parteien.value.reduce((max, p) => Math.max(max, p.hn.pattaufloesung), 0))
        data.ergebnisse.hn.summeRestsitze = computed(() => data.helper.hn.summeRestsitzeGesamt - data.ergebnisse.hn.summePatt)
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
    setupQuotientenVerfahren("dh", Array.from({ length: 19 }, (_, i) => i + 1))

    function deleteItem(id) {
        const idx = data.parteien.findIndex(item => item.id === id)
        data.parteien.splice(idx, 1)
    }

    function addItem(partei = neuePartei("Test", 123)) {
        data.parteien.push(partei)
    }

    function clear() {
        startConfig.sitzeHauptorgan = 0
        startConfig.sitzeAusschuss = 0
        startConfig.pattAufloesung = pattAufloesungEnum.LOS.value

        parteien.value.splice(0)
    }

    function loadDefaults() {
        clear()

        startConfig.sitzeHauptorgan = 70
        startConfig.sitzeAusschuss = 14 // 8 für SLS
        startConfig.pattAufloesung = pattAufloesungEnum.STIMMEN.value

        data.parteien.push(
            neuePartei("CSU", 20, "", 6543),
            neuePartei("GRÜNE", 16, "", 5432), // 20 für SL/S
            neuePartei("FREIE WÄHLER", 10, "", 4321),
            neuePartei("SPD", 8, "", 3210),
            neuePartei("AfD", 4, "", 2345),
            neuePartei("FDP", 3, agEnum.AG_2.value, 1234),
            neuePartei("LINKE", 2, agEnum.AG_2.value, 1111),
            neuePartei("ÖDP", 2, agEnum.AG_1.value, 1000),
            neuePartei("Bayernpartei", 2, agEnum.AG_2.value, 211),
            neuePartei("FRANKEN", 2, agEnum.AG_1.value, 987),
            neuePartei("Tierschutzpartei", 1, agEnum.AG_1.value, 182)
        )
    }

    return {
        data,
        startConfig,

        clear,
        loadDefaults,

        addItem,
        deleteItem
    }
}

const globalState = newStateInstance()

export function useState() {
    return globalState
}
