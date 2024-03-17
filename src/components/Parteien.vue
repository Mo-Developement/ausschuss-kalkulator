<script>
import DataBar from "./DataBar.vue"

import { data, deleteItem, startConfig } from "../store/index.js"

export default {
  name: 'ParteiDaten',
  setup() {
    return { data }
  },
  computed: {
    summeHauptorganKorrekt() {
      return {
        'correct': this.data.ergebnisse.summeSitzeHauptorgan == startConfig.sitzeHauptorgan,
        'false': this.data.ergebnisse.summeSitzeHauptorgan != startConfig.sitzeHauptorgan
      }
    }
  },
  methods: {
    deleteItem
  },
  components: {
    DataBar
  }
}
</script>

<template>
<table>
  <thead>
    <tr class="bold centered">
      <th colspan="3">
        Zusammensetzung Hauptorgan<br>(ohne Ausschussgemeinschaften)
      </th>
      <th colspan="2">
        Info
      </th>
      <th colspan="4">
        Zulässigkeit Verfahren
      </th>
    </tr>
    <tr>
      <td>Partei/<wbr>Wählergruppe</td>
      <td>Sitze im Haupt&shy;organ</td>
      <td>AG?</td>
      <td>Proporz&shy;genaue Zahl Ausschuss</td>
      <td>Sicher vertreten?</td>
      <td>Quoten&shy;kriterium</td>
      <td>H/N</td>
      <td>SL/S</td>
      <td>d'H</td>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <td>
        <button @click="deleteItem(entry.id)">löschen</button>
        {{ entry.name }}
      </td>
      <td class="right">{{ entry.sitzeHauptorgan }}</td>
      <td>{{ entry.ag }}</td>
      <td>
        <DataBar :current="entry.proporzgenaueZahlAusschuss" :max="data.helper.maxProporzgenaueZahlAusschuss" :decimals="2" />
      </td>
      <td>{{ entry.sicherVertreten === true ? "ja" : "nein" }}</td>
      <td class="centered">{{ entry.quotenKriterium }}</td>
      <td>OK</td>
      <td></td>
      <td>xxx</td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="bold">
      <td class="left">Summe</td>
      <td :class="summeHauptorganKorrekt">
        {{ data.ergebnisse.summeSitzeHauptorgan }}
      </td>
      <td></td>
      <td>
        {{ data.ergebnisse.summeProporzgenaueZahlAusschuss }}
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>xxx</td>
    </tr>
  </tfoot>
</table>

<table>
  <thead>
    <tr class="bold centered">
      <th colspan="2">
        Hare/Niemeyer
      </th>
      <th colspan="8">
      </th>
    </tr>
    <tr>
      <td>Sitze</td>
      <td>Patt Auf&shy;lösung</td>
      <td>S ganz</td>
      <td>S Rest</td>
      <td>Rng Rest</td>
      <td>Rest&shy;sitz</td>
      <td>Patt</td>
      <td>Los Chance</td>
      <td>Stimmen/<wbr>Gelost</td>
      <td>Patt&shy;gewinn</td>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <td>
        <DataBar :current="entry.hN.sitze" :max="data.helper.maxHNSitze" />
      </td>
      <td>
        <DataBar :current="entry.hN.pattaufloesung" :max="data.helper.maxHNPattaufloesung" />
      </td>
      <td>
        <DataBar :current="entry.hN.sitzeGanz" :max="data.helper.maxHNSitzeGanz" />
      </td>
      <td class="right">
        {{ entry.hN.sitzeRest.toFixed(4) }}
      </td>
      <td class="centered">
        {{ entry.hN.rangRest }}.
      </td>
      <td class="right">
        {{ entry.hN.restsitz }}
      </td>
      <td class="centered">
        {{ entry.hN.patt ? "ja" : "nein" }}
      </td>
      <td class="right">
        {{ Math.round(entry.hN.losChance * 100) + " %" }}
      </td>
      <td class="right">
        {{ entry.hN.stimmenGelost }}
      </td>
      <td class="centered">
        {{ entry.hN.pattgewinn ? "ja" : "nein" }}
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="bold">
      <td>{{ data.ergebnisse.summeHNSitze }}</td>
      <td>{{ data.ergebnisse.summeHNPattaufloesung }}</td>
      <td>{{ data.ergebnisse.summeHNSitzeGanz }}</td>
      <td>{{ data.ergebnisse.summeHNSitzeRest }}</td>
      <td></td>
      <td>{{ data.ergebnisse.summeHNRestsitze }}</td>
      <td>{{ data.ergebnisse.summeHNPatt }}</td>
      <td>{{ data.ergebnisse.summeHNLosChance }}</td>
      <td></td>
      <td></td>
    </tr>
  </tfoot>
</table>

<table>
  <thead>
    <tr class="bold centered">
      <th colspan="2">
        Sainte-Laguë/<wbr>Schepers
      </th>
      <th colspan="19">
        Quotienten
      </th>
      <th colspan="19">
        Rangzahlen
      </th>
      <th colspan="19">
        Sitze
      </th>
      <th colspan="4">
        Patt
      </th>
      <th>
        Zulässig
      </th>
    </tr>
    <tr class="bold">
      <td>Sitze</td>
      <td>Patt Auf&shy;lösung</td>
      <td class="right" v-for="(q, key) in data.helper.slsQuotienten" :key="key">
        :{{ q }}
      </td>
      <td class="right" v-for="(q, key) in data.helper.slsQuotienten" :key="key">
        R{{ q }}
      </td>
      <td class="right" v-for="(q, key) in data.helper.slsQuotienten" :key="key">
        SP{{ q }}
      </td>
      <td class="centered">Patt?</td>
      <td class="right">Los Chance</td>
      <td class="right">Stimmen Gelost</td>
      <td class="centered">Patt&shy;gewinn</td>
      <td class="centered">QK verletzt</td>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <td>
        <DataBar :current="entry.sls.sitzeGesamt" :max="data.helper.slsMaxSitzeGesamt" />
      </td>
      <td>
        <DataBar :current="entry.sls.pattaufloesung" :max="data.helper.slsMaxPattaufloesung" />
      </td>
      <td class="right" v-for="[q, value] in entry.sls.quotienten" :key="q">
        {{ value.toFixed(2) }}
      </td>
      <td class="right" v-for="[q, value] in entry.sls.raenge" :key="q">
        {{ value }}.
      </td>
      <td class="right" v-for="[q, value] in entry.sls.sitze" :key="q">
        {{ value }}
      </td>
      <td class="centered">
        {{ entry.sls.patt ? "ja" : "nein" }}
      </td>
      <td class="right">
        {{ Math.round(entry.sls.losChance * 100) + " %" }}
      </td>
      <td class="right">
        {{ entry.sls.stimmenGelost }}
      </td>
      <td class="centered">
        {{ entry.sls.pattgewinn ? "ja" : "nein" }}
      </td>
      <td class="centered">
        {{ entry.sls.qkVerletzt ? "ja" : "nein" }}
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="bold">
      <td>{{ data.ergebnisse.summeSLSSitzeGesamt }}</td>
      <td>{{ data.ergebnisse.summeSLSPattaufloesung }}</td>
      <td colspan="19"></td>
      <td colspan="19"></td>
      <td colspan="19"></td>
      <td>{{ data.ergebnisse.summeSLSPatt }}</td>
      <td>{{ data.ergebnisse.summeSLSLosChance }}</td>
      <td></td>
      <td></td>
      <td>{{ data.ergebnisse.summeSLSQkVerletzt }}</td>
    </tr>
  </tfoot>
</table>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

table, td, th {
  border: 1px solid grey;
}

tbody td {
  border: none;
}

tbody tr:nth-child(odd) {
  background-color: lightgrey;
}

tbody tr:nth-child(even) {
  background-color: whitesmoke;
}

table tfoot td {
  text-align: right;
}

.bold {
  font-weight: bold;
}

.centered {
  text-align: center;
}

.right {
  text-align: right;
}

.left {
  text-align: left;
}

.correct {
  background-color: greenyellow;
}

.false {
  background-color: red;
}
</style>
