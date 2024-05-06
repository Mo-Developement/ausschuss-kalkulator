import { computed, reactive, ref } from "vue"

import { pattAufloesungEnum, sitzStatus, verfahren } from "./enums.js"
import { countOccurences, rankDuplicate } from "./index.js"
import { formatAGWithMemberNames, formatDecimal } from "@/utils/formatter.js"

const schritte = Object.freeze({
    START: 0,
    VERSCHIEBUNG: 1,
    AG: 2
})

function newStateInstance() {
    let count = 1

    /**
     * Generiert ein neues Objekt mit den Daten einer Partei
     * @param {number} schritt - Schritt, für den die Partei erzeugt wird
     * @param {number|null} originID - ID des Objekts, aus dem dieses erzeugt wird - falls neu: null
     * @param {string} name - Name der Partei/AG
     * @param {number} [sitzeHauptorgan=0] - Anzahl der Sitze im Hauptorgan
     * @param {number|null} [stimmen=null] - Anzahl der Wählerstimmen - für AG: null
     * @param {number|null} [ag=null] - ID der angehörigen Ausschussgemeinschaft
     * @param {number} [plus=0] - zusätzliche Ausschusssitze für die Partei
     * @param {number} [minus=0] - Austritte aus der Partei
     * @param {string} [nameNeu=''] - evtl. neuer Name aus Schritt 2
     */
    function neuePartei(schritt, originID, name, sitzeHauptorgan=0, stimmen=0, ag=null, plus=0, minus=0, nameNeu='') {
        const neu = {
            id: count,
            originID: originID,

            name: ref(name),
            nameNeu: ref(nameNeu),
            sitzeHauptorgan: schritt === schritte.VERSCHIEBUNG ? computed(() => sitzeHauptorgan + plus - minus) : ref(sitzeHauptorgan),
            stimmen: ref(stimmen),
            ag: ref(ag),
            sitzePlus: plus,
            sitzeMinus: minus
        }

        if (schritt === schritte.VERSCHIEBUNG || schritt === schritte.AG) {
            neu.proporzgenaueZahlAusschuss = computed(() => neu.sitzeHauptorgan.value / data[schritte.VERSCHIEBUNG].ergebnisse.summeSitzeHauptorgan * startConfig.sitzeAusschuss || 0)
            neu.qkMin = computed(() => Math.floor(neu.proporzgenaueZahlAusschuss.value))
            neu.qkMax = computed(() => Math.ceil(neu.proporzgenaueZahlAusschuss.value))
            
            neu.sicherDrin = computed(() => neu.sitzeHauptorgan.value > data[schritte.VERSCHIEBUNG].ergebnisse.summeSitzeHauptorgan / (1 + startConfig.sitzeAusschuss))
        }

        if (schritt === schritte.AG) {
            neu.az = {}
            neu.az[verfahren.D_HONDT.dataKey]        = computed(() => neu.sitzeHauptorgan.value / (neu.qkMin.value + 1))
            neu.az[verfahren.HARE_NIEMEYER.dataKey]  = computed(() => startConfig.sitzeAusschuss * neu.sitzeHauptorgan.value / data[schritte.AG].ergebnisse.summeSitzeHauptorgan - neu.qkMin.value)
            neu.az[verfahren.LAGUE_SCHEPERS.dataKey] = computed(() => neu.sitzeHauptorgan.value / (neu.qkMin.value * 2 + 1))
            neu.azAktuell                            = computed(() => neu.qkMin.value === neu.qkMax.value ? 0 : neu.az[startConfig.verfahren].value)
            neu.anspruch                             = computed(() => {
                if (neu.azAktuell.value === 0) return ""

                const formel = returnForCurrentVerfahren({
                    "dh":  `${neu.sitzeHauptorgan.value}/${neu.qkMax.value}`,
                    "hn":  `${startConfig.sitzeAusschuss} * ${neu.sitzeHauptorgan.value} / ${data[schritte.AG].ergebnisse.summeSitzeHauptorgan} - ${neu.qkMin.value}`,
                    "sls": `${neu.sitzeHauptorgan.value}/${neu.qkMin.value * 2 + 1}`
                })

                return `${neu.qkMax.value}. Sitz: ${formel} = ${formatDecimal(neu.azAktuell.value, 4)}`
            })
            neu.rangAz = computed(() => data[schritte.AG].helper.raengeAzAktuell.get(neu.azAktuell.value))
            neu.status = computed(() => {
                const summeQkMin = data[schritte.AG].parteien.reduce((sum, p) => sum + p.qkMin, 0)

                if (data[schritte.AG].parteien.filter(p => p.rangAz <= neu.rangAz.value).length <= startConfig.sitzeAusschuss - summeQkMin)
                    return sitzStatus.SITZ

                if (data[schritte.AG].parteien.filter(p => p.rangAz < neu.rangAz.value).length <= startConfig.sitzeAusschuss - summeQkMin)
                    return sitzStatus.PATT

                return sitzStatus.LEER
            })
            neu.sitze = computed(() => neu.qkMin.value + +(neu.status.value === sitzStatus.SITZ))
            neu.losChance = computed(() => neu.status.value !== sitzStatus.PATT ? 0
                : (startConfig.sitzeAusschuss - data[schritte.AG].ergebnisse.summeSitze) / data[schritte.AG].parteien.filter(p => p.status === sitzStatus.PATT).length)

            neu.stimmenZulaessig = computed(() => neu.losChance.value === 0 || (neu.stimmen.value !== null && (neu.sitzePlus + neu.sitzeMinus === 0)))
            neu.stimmenSitz      = computed(() => (data[schritte.AG].helper.alleStimmenZulaessig && neu.losChance.value > 0) ? neu.stimmen.value : 0)
            neu.rangStimmenSitz  = computed(() => data[schritte.AG].helper.raengeStimmenSitz.get(neu.stimmenSitz.value) <= data[schritte.AG].ergebnisse.summeLosChance)
            neu.stimmenZahl      = computed(() => {
                if (neu.losChance.value === 0) return ""
                if (data[schritte.AG].helper.alleStimmenZulaessig === false) return "UNZULÄSSIG"
                return `${neu.stimmenSitz.value ? '' : 'K: '}SITZ (${neu.stimmenSitz.value})`
            })

            neu.zufallsZahl = ref(0)
            neu.zufall      = computed(() => neu.zufallsZahl.value * neu.losChance.value)
            neu.verlosung   = computed(() => {
                if (neu.losChance.value === 0) return ""
                const hatSitz = data[schritte.AG].helper.raengeZufall.get(neu.zufall.value) <= data[schritte.AG].ergebnisse.summeLosChance
                return `${hatSitz ? "SITZ" : "NIETE"} (${formatDecimal(neu.zufall.value, 4)})`
            })

            neu.pattaufloesung   = computed(() => startConfig.pattAufloesung === pattAufloesungEnum.STIMMEN.value
                ? neu.stimmenZahl.value
                : neu.verlosung.value)
        }

        count++

        return neu
    }

    const startConfig = reactive({
        sitzeAusschuss: 0,
        verfahren: '',
        pattAufloesung: '',
    })

    function returnForCurrentVerfahren(o) {
        return o[startConfig.verfahren]
    }

    const data = reactive({})
    
    function setupInitialData() {
        for (const schritt of Object.values(schritte)) {
            data[schritt] = {
                ergebnisse: {
                    summeSitzeHauptorgan: computed(() => data[schritt].parteien.reduce((sum, p) => sum + p.sitzeHauptorgan, 0))
                },
                helper: {
                    maxSitzeHauptorgan: computed(() => data[schritt].parteien.reduce((max, p) => Math.max(max, p.sitzeHauptorgan), 0))
                }
            }
        }

        // Schritt 1
        data[schritte.START].parteien = computed(() => inputParteien.value)

        // Schritt 2
        data[schritte.VERSCHIEBUNG].parteien = computed(() => data[schritte.START].parteien
            .map(p => reactive(neuePartei(schritte.VERSCHIEBUNG, p.id, p.name, p.sitzeHauptorgan, p.stimmen, p.ag, p.sitzePlus, p.sitzeMinus, p.nameNeu)))
            .concat(reactive(zusatzParteien.value)))

        data[schritte.VERSCHIEBUNG].helper.maxProporzgenaueZahlAusschuss = computed(() => data[schritte.VERSCHIEBUNG].parteien.reduce((max, p) => Math.max(max, p.proporzgenaueZahlAusschuss), 0))

        // Schritt 3
        data[schritte.AG].parteien = computed(() => data[schritte.VERSCHIEBUNG].parteien
            .map(p => reactive(neuePartei(schritte.AG, p.originID === null ? p.id : p.originID, p.name, p.ag === null ? p.sitzeHauptorgan : 0, p.stimmen, p.ag, p.sitzePlus, p.sitzeMinus, p.nameNeu)))
            .concat(reactive(ags.value)))

        data[schritte.AG].helper.raengeAzAktuell    = computed(() => rankDuplicate(countOccurences(data[schritte.AG].parteien.map(p => p.azAktuell))))

        data[schritte.AG].ergebnisse.summeSitze     = computed(() => data[schritte.AG].parteien.reduce((sum, p) => sum + p.sitze, 0))
        data[schritte.AG].helper.maxSitze           = computed(() => data[schritte.AG].parteien.reduce((max, p) => Math.max(max, p.sitze), 0))

        data[schritte.AG].ergebnisse.summeLosChance = computed(() => Math.round(data[schritte.AG].parteien.reduce((sum, p) => sum + p.losChance, 0)))
        data[schritte.AG].helper.maxLosChance       = computed(() => data[schritte.AG].parteien.reduce((max, p) => Math.max(max, p.losChance), 0))

        data[schritte.AG].helper.alleStimmenZulaessig = computed(() => data[schritte.AG].parteien.every(p => p.stimmenZulaessig))
        data[schritte.AG].helper.raengeStimmenSitz  = computed(() => rankDuplicate(countOccurences(data[schritte.AG].parteien.map(p => p.stimmenSitz))))
        data[schritte.AG].helper.raengeZufall       = computed(() => rankDuplicate(countOccurences(data[schritte.AG].parteien.map(p => p.zufall))))
    }

    const ags = computed(() => {
        const groupedByAgId = Object.groupBy(data[schritte.VERSCHIEBUNG].parteien.filter(p => p.ag !== null), ({ ag }) => ag)
        return Object.entries(groupedByAgId)
            .toSorted((a, b) => +a[0] - (+b[0]))  // AGs nach Nummer sortieren
            .map(([id, parteien]) => {
                return neuePartei(
                    schritte.AG,
                    null,
                    formatAGWithMemberNames(id, parteien.map(p => p.name)),
                    parteien.reduce((sum, p) => sum + p.sitzeHauptorgan, 0),
                    null
                )
            })
    })

    const inputParteien = ref([])
    const zusatzParteien = ref([])
    setupInitialData()
    
    function addPartei(isStartPartei) {
        if (isStartPartei) {
            inputParteien.value.push(neuePartei(schritte.START, null, '---'))
        } else {
            zusatzParteien.value.push(neuePartei(schritte.VERSCHIEBUNG, null, '---'))
        }
    }
    
    function updatePartei(id, property, value) {
        let idx = inputParteien.value.findIndex(item => item.id === id)
        if (idx !== -1) {
            inputParteien.value[idx][property] = value
        } else {
            idx = zusatzParteien.value.findIndex(item => item.id === id)
            zusatzParteien.value[idx][property] = value
        }
    }

    function deleteItem(id) {
        let idx = inputParteien.value.findIndex(item => item.id === id)
        if (idx !== -1) {
            inputParteien.value.splice(idx, 1)
        } else {
            idx = zusatzParteien.value.findIndex(item => item.id === id)
            zusatzParteien.value.splice(idx, 1)
        }
    }

    function randomize() {
        data[schritte.AG].parteien.forEach(p => p.zufallsZahl = Math.random())
    }

    function setStartConfig(sitzeAusschuss, verfahren, pattAufloesung) {
        startConfig.sitzeAusschuss = sitzeAusschuss
        startConfig.verfahren = verfahren
        startConfig.pattAufloesung = pattAufloesung
    }

    function clear() {
        setStartConfig(0, verfahren.HARE_NIEMEYER.dataKey, pattAufloesungEnum.LOS.value)

        inputParteien.value.splice(0)
        zusatzParteien.value.splice(0)
    }

    function loadDefaults() {
        clear()

        setStartConfig(13, verfahren.D_HONDT.dataKey, pattAufloesungEnum.LOS.value)

        inputParteien.value.push(
            neuePartei(schritte.START, null, "CSU", 20, 6543, null, 1, 1),
            neuePartei(schritte.START, null, "GRÜNE", 15, 5432, null, 1),
            neuePartei(schritte.START, null, "FREIE WÄHLER", 10, 4321, null),
            neuePartei(schritte.START, null, "SPD", 8, 3210, null, 0, 1),
            neuePartei(schritte.START, null, "AfD", 6, 2345, null),
            neuePartei(schritte.START, null, "FDP", 4, 1234, null, 0, 1),
            neuePartei(schritte.START, null, "LINKE", 3, 1111, 1, 0, 1),
            neuePartei(schritte.START, null, "ÖDP", 2, 1000, 2),
            neuePartei(schritte.START, null, "Bayernpartei", 1, 384, 3),
            neuePartei(schritte.START, null, "Tierschutzpartei", 1, 211, 2),
            neuePartei(schritte.START, null, "FRANKEN", 0, 182, 4)
        )

        zusatzParteien.value.push(
            neuePartei(schritte.VERSCHIEBUNG, null, "Müller, Herr", 0, 0, 1, 1, 0),
            neuePartei(schritte.VERSCHIEBUNG, null, "Mayer, Frau", 0, 0, 3, 1, 0)
        )

        randomize()
    }

    function loadFromJson(json) {
        const obj = JSON.parse(json)
        const { prototyp: { config: conf } } = obj
        const { prototyp: { parteien: neueParteien } } = obj
        const { prototyp: { zusatzParteien: neueZusatzParteien } } = obj

        clear()
        setStartConfig(conf.sitzeAusschuss, conf.verfahren, conf.pattAufloesung)
        neueParteien.forEach(p => inputParteien.value.push(
            neuePartei(schritte.START, null, p.name, p.sitzeHauptorgan, p.stimmen, p.ag, p.sitzePlus, p.sitzeMinus, p.nameNeu)))
        neueZusatzParteien.forEach(p => zusatzParteien.value.push(
            neuePartei(schritte.VERSCHIEBUNG, null, p.name, p.sitzeHauptorgan, p.stimmen, p.ag, p.sitzePlus, p.sitzeMinus, p.nameNeu)))

        randomize()
    }

    function prepareForJson() {
        return {
            prototyp: {
                config: startConfig,
                parteien: inputParteien.value.map(({ name, stimmen, sitzeHauptorgan, nameNeu, sitzePlus, sitzeMinus, ag }) => ({ name, stimmen, sitzeHauptorgan, nameNeu, sitzePlus, sitzeMinus, ag })),
                zusatzParteien: zusatzParteien.value.map(({ name, stimmen, sitzeHauptorgan, nameNeu, sitzePlus, sitzeMinus, ag }) => ({ name, stimmen, sitzeHauptorgan, nameNeu, sitzePlus, sitzeMinus, ag }))
            }
        }
    }

    return {
        data,
        startConfig,
        schritte,

        clear,
        loadDefaults,
        randomize,
        loadFromJson,
        prepareForJson,

        addPartei,
        updatePartei,
        deleteItem
    }
}

const globalState = newStateInstance()

export function useState() {
    return globalState
}
