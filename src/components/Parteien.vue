<script>
import DataBar from "./DataBar.vue"

import { data, deleteItem, startConfig } from "../store/index.js"

export default {
  name: 'ParteiDaten',
  setup() {
    return { data }
  },
  data() {
    return {
      style: {
        hn: {
          details: false
        },
        sls: {
          details: false,
          quotientenDetails: false,
          rangDetails: false,
          sitzeDetails: false,
          pattDetails: false
        }
      }
    }
  },
  computed: {
    summeHauptorganKorrekt() {
      return [
        this.data.ergebnisse.summeSitzeHauptorgan == startConfig.sitzeHauptorgan ? 'correct' : 'false'
      ]
    },
    hnZelleEingeblendet() {
      return {
        'hidden': !this.style.hn.details
      }
    },
  },
  methods: {
    deleteItem,
    subHeaderView(dataList, parentDetails, details) {
      const end = parentDetails === true
        ? (details === true ? dataList.length : 1)
        : 0
      return dataList.slice(0, end)
    },
    dataView(entry, parentDetails, details) {
      const end = parentDetails === true
        ? (details === true ? entry.size : 1)
        : 0
      return new Map(Array.from(entry.entries()).slice(0, end))
    },
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
      <th>Partei/<wbr>Wählergruppe</th>
      <th>Sitze im Haupt&shy;organ</th>
      <th>AG?</th>
      <th>Proporz&shy;genaue Zahl Ausschuss</th>
      <th>Sicher vertreten?</th>
      <th>Quoten&shy;kriterium</th>
      <th class="header-hn">H/N</th>
      <th class="header-sls">SL/S</th>
      <th class="header-dh">d'H</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <td>
        <button @click="deleteItem(entry.id)">löschen</button>
        {{ entry.name }}
      </td>
      <td class="right">
        {{ entry.sitzeHauptorgan }}
      </td>
      <td>
        {{ entry.ag }}</td>
      <td>
        <DataBar :current="entry.proporzgenaueZahlAusschuss" :max="data.helper.maxProporzgenaueZahlAusschuss" :decimals="2" />
      </td>
      <td>
        {{ entry.sicherVertreten === true ? "ja" : "nein" }}
      </td>
      <td class="centered">
        {{ entry.quotenKriterium }}
      </td>
      <td>
        OK
      </td>
      <td>
        {{ entry.sls.qkVerletzt ? "NOK" : "OK" }}</td>
      <td>
        xxx
      </td>
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
      <td></td>
    </tr>
  </tfoot>
</table>

<table>
  <thead>
    <tr class="bold centered">
      <th colspan="2">
        Hare/Niemeyer
        <button @click="style.hn.details = !style.hn.details">{{ this.style.hn.details ? "-" : "+" }}</button>
      </th>
      <th colspan="8" v-show="this.style.hn.details">
      </th>
    </tr>
    <tr>
      <th>Sitze</th>
      <th>Patt Auf&shy;lösung</th>
      <th v-show="this.style.hn.details">S ganz</th>
      <th v-show="this.style.hn.details">S Rest</th>
      <th v-show="this.style.hn.details">Rng Rest</th>
      <th v-show="this.style.hn.details">Rest&shy;sitz</th>
      <th v-show="this.style.hn.details">Patt</th>
      <th v-show="this.style.hn.details">Los Chance</th>
      <th v-show="this.style.hn.details">Stimmen/<wbr>Gelost</th>
      <th v-show="this.style.hn.details">Patt&shy;gewinn</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <td>
        <DataBar :current="entry.hN.sitze" :max="data.helper.maxHNSitze" />
      </td>
      <td>
        <DataBar :current="entry.hN.pattaufloesung" :max="data.helper.maxHNPattaufloesung" :decimals="2" />
      </td>
      <td v-show="this.style.hn.details">
        <DataBar :current="entry.hN.sitzeGanz" :max="data.helper.maxHNSitzeGanz" />
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ entry.hN.sitzeRest.toFixed(4) }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ entry.hN.rangRest }}.
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ entry.hN.restsitz }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ entry.hN.patt ? "ja" : "nein" }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ Math.round(entry.hN.losChance * 100) + " %" }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ entry.hN.stimmenGelost }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ entry.hN.pattgewinn ? "ja" : "nein" }}
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="bold">
      <td>{{ data.ergebnisse.summeHNSitze }}</td>
      <td>{{ data.ergebnisse.summeHNPattaufloesung }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.summeHNSitzeGanz }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.summeHNSitzeRest }}</td>
      <td v-show="this.style.hn.details"></td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.summeHNRestsitze }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.summeHNPatt }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.summeHNLosChance }}</td>
      <td v-show="this.style.hn.details"></td>
      <td v-show="this.style.hn.details"></td>
    </tr>
  </tfoot>
</table>

<table>
  <thead>
    <tr class="bold centered">
      <th colspan="2">
        Sainte-Laguë/<wbr>Schepers
        <button class="hand" @click="style.sls.details = !style.sls.details">{{ this.style.sls.details ? "-" : "+" }}</button>
      </th>
      <th v-if="this.style.sls.details" :colspan="this.style.sls.quotientenDetails === true ? 19 : 1">
        Quotienten
        <button class="hand" @click="style.sls.quotientenDetails = !style.sls.quotientenDetails">{{ this.style.sls.quotientenDetails ? "-" : "+" }}</button>
      </th>
      <th v-if="this.style.sls.details" :colspan="this.style.sls.rangDetails === true ? 19 : 1">
        Rangzahlen
        <button class="hand" @click="style.sls.rangDetails = !style.sls.rangDetails">{{ this.style.sls.rangDetails ? "-" : "+" }}</button>
      </th>
      <th v-if="this.style.sls.details" :colspan="this.style.sls.sitzeDetails === true ? 19 : 1">
        Sitze
        <button class="hand" @click="style.sls.sitzeDetails = !style.sls.sitzeDetails">{{ this.style.sls.sitzeDetails ? "-" : "+" }}</button>
      </th>
      <th v-if="this.style.sls.details" :colspan="this.style.sls.pattDetails === true ? 4 : 1">
        Patt
        <button class="hand" @click="style.sls.pattDetails = !style.sls.pattDetails">{{ this.style.sls.pattDetails ? "-" : "+" }}</button>
      </th>
      <th v-if="this.style.sls.details" >
        Zulässig
      </th>
    </tr>
    <tr class="bold">
      <th>Sitze</th>
      <th>Patt Auf&shy;lösung</th>

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.slsQuotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="key">
        :{{ q }}
      </th>

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.slsQuotienten, this.style.sls.details, this.style.sls.rangDetails)" :key="key">
        R{{ q }}
      </th>

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.slsQuotienten, this.style.sls.details, this.style.sls.sitzeDetails)" :key="key">
        SP{{ q }}
      </th>

      <th class="centered" v-if="this.style.sls.details">Patt?</th>
      <th class="right" v-if="this.style.sls.details && this.style.sls.pattDetails">Los Chance</th>
      <th class="right" v-if="this.style.sls.details && this.style.sls.pattDetails">Stimmen Gelost</th>
      <th class="centered" v-if="this.style.sls.details && this.style.sls.pattDetails">Patt&shy;gewinn</th>
      <th class="centered" v-if="this.style.sls.details">QK verletzt</th>
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

      <td class="right" v-for="[q, value] in dataView(entry.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="q">
        {{ value.toFixed(2) }}
      </td>

      <td class="right" v-for="[q, value] in dataView(entry.sls.raenge, this.style.sls.details, this.style.sls.rangDetails)" :key="q">
        {{ value }}.
      </td>

      <td class="right" v-for="[q, value] in dataView(entry.sls.sitze, this.style.sls.details, this.style.sls.sitzeDetails)" :key="q">
        {{ value }}
      </td>

      <td class="centered" v-if="this.style.sls.details">
        {{ entry.sls.patt ? "ja" : "nein" }}
      </td>
      <td class="right" v-if="this.style.sls.details && this.style.sls.pattDetails">
        {{ Math.round(entry.sls.losChance * 100) + " %" }}
      </td>
      <td class="right" v-if="this.style.sls.details && this.style.sls.pattDetails">
        {{ entry.sls.stimmenGelost }}
      </td>
      <td class="centered" v-if="this.style.sls.details && this.style.sls.pattDetails">
        {{ entry.sls.pattgewinn ? "ja" : "nein" }}
      </td>
      <td class="centered" v-if="this.style.sls.details">
        {{ entry.sls.qkVerletzt ? "ja" : "nein" }}
      </td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="bold">
      <td>{{ data.ergebnisse.summeSLSSitzeGesamt }}</td>
      <td>{{ data.ergebnisse.summeSLSPattaufloesung }}</td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.quotientenDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.rangDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.sitzeDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details">{{ data.ergebnisse.summeSLSPatt }}</td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails">{{ data.ergebnisse.summeSLSLosChance }}</td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails"></td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails"></td>
      <td v-if="this.style.sls.details">{{ data.ergebnisse.summeSLSQkVerletzt }}</td>
    </tr>
  </tfoot>
</table>
</template>

<style scoped>
@import url("../assets/css/theme-colours.css");

table {
  border-collapse: collapse;
}

table, td, th {
  border: 2px solid var(--table-cell-separator);
}

tbody td {
  border: none;
}

th {
  background-color: var(--table-header);
}

tbody tr:nth-child(odd) {
  background-color: var(--table-row-odd);
}

tbody tr:nth-child(even) {
  background-color: var(--table-row-even);
}

tfoot td {
  background-color: var(--table-row-even);
}

table tfoot td {
  text-align: right;
}

.header-hn {
  background-color: var(--highlight-hn);
  color: var(--text-light);
}

.header-sls {
  background-color: var(--highlight-sls);
  color: var(--text-light);
}

.header-dh {
  background-color: var(--highlight-dh);
  color: var(--text-light);
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

.hidden {
  display: none;
}

.hand {
  cursor: pointer;
}
</style>
