<script>
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import DataTable from 'primevue/datatable'
import Row from 'primevue/row'

import DataBar from "./DataBar.vue"

import { useState } from "../store/index.js"

export default {
  name: 'ParteiDaten',
  setup() {
    const { deleteItem, clear, loadDefaults, data, startConfig } = useState()
    return { deleteItem, clear, loadDefaults, data, startConfig }
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
        this.data.ergebnisse.summeSitzeHauptorgan == this.startConfig.sitzeHauptorgan ? 'correct' : 'false'
      ]
    },
  },
  methods: {
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
    formatYesNo(value) {
      return value === true ? "ja" : "nein"
    },
    formatOkNok(value) {
      return value === true ? "OK" : "NOK"
    },
    formatDecimal(value, precision) {
      return value.toFixed(precision).replace(/\./g, ",")
    },
    formatPercent(value) {
      return Math.round(value * 100) + " %"
    },
    formatRank(value) {
      return value + "."
    },
  },
  components: { Button, Checkbox, Column, ColumnGroup, DataBar, DataTable, Row }
}
</script>

<template>
<DataTable :value="data.parteien" dataKey="id" size="small" striped-rows show-gridlines>
  <ColumnGroup type="header">
    <Row>
      <Column :colspan="2">
        <template #header>
          <div class="centered" style="width: 100%;">
            Zusammensetzung Hauptorgan<br>(ohne Ausschussgemeinschaften)
          </div>
        </template>
      </Column>
      <Column :colspan="3">
        <template #header>
          <div class="centered" style="width: 100%;">Info</div>
        </template>
      </Column>
      <Column :colspan="4">
        <template #header>
          <div class="centered" style="width: 100%;">Zulässigkeit Verfahren</div>
        </template>
      </Column>

      <!-- header hn -->
      <Column class="hidden" />
      <Column header="Hare/Niemeyer" :colspan="2">
        <template #header>
          <Checkbox v-model="this.style.hn.details" :binary="true" v-tooltip.top="'Details ein-/ausblenden'" aria-label="Details zum Hare/Niemeyer-Verfahren anzeigen" />
        </template>
      </Column>
      <Column v-if="this.style.hn.details" class="th-empty-top-right-corner" :colspan="8" />

      <!-- header sls -->
      <Column class="hidden" />
      <Column header="Sainte-Laguë/Schepers" :colspan="2">
        <template #header>
          <Checkbox v-model="this.style.sls.details" :binary="true" v-tooltip.top="'Details ein-/ausblenden'" aria-label="Details zum Sainte-Laguë/Schepers-Verfahren anzeigen" />
        </template>
      </Column>
      <Column v-if="this.style.sls.details" header="Quotienten" :colspan="this.style.sls.quotientenDetails === true ? 19 : 1">
        <template #header>
          <Checkbox v-model="this.style.sls.quotientenDetails" :binary="true" aria-label="Quotientendetails ein-/ausblenden" />
        </template>
      </Column>
      <Column v-if="this.style.sls.details" header="Rangzahlen" :colspan="this.style.sls.rangDetails === true ? 19 : 1">
        <template #header>
          <Checkbox v-model="this.style.sls.rangDetails" :binary="true" aria-label="Rangzahlendetails ein-/ausblenden" />
        </template>
      </Column>
      <Column v-if="this.style.sls.details" header="Sitze" :colspan="this.style.sls.sitzeDetails === true ? 19 : 1">
        <template #header>
          <Checkbox v-model="this.style.sls.sitzeDetails" :binary="true" aria-label="Sitzdetails ein-/ausblenden" />
        </template>
      </Column>
      <Column v-if="this.style.sls.details" header="Patt" :colspan="this.style.sls.pattDetails === true ? 4 : 1">
        <template #header>
          <Checkbox v-model="this.style.sls.pattDetails" :binary="true" aria-label="Pattdetails ein-/ausblenden" />
        </template>
      </Column>
      <Column v-if="this.style.sls.details" header="Zulässig" />
    </Row>
    <Row>
      <Column header="Partei/Wählergruppe" />
      <Column header="Sitze im Hauptorgan" />
      <Column header="AG?" />
      <Column header="Proporzgenaue Zahl Ausschuss" />
      <Column header="Sicher vertreten?" />
      <Column header="Quotenkriterium" />
      <Column header="H/N" class="header-hn" />
      <Column header="SL/S" />
      <Column header="d'H" />

      <!-- subheader hn -->
      <Column class="hidden" />
      <Column header="Sitze" />
      <Column header="Patt Auflösung" />
      <Column v-if="this.style.hn.details" header="S ganz" />
      <Column v-if="this.style.hn.details" header="S Rest" />
      <Column v-if="this.style.hn.details" header="Rng Rest" />
      <Column v-if="this.style.hn.details" header="Rest&shy;sitz" />
      <Column v-if="this.style.hn.details" header="Patt" />
      <Column v-if="this.style.hn.details" header="Los Chance" />
      <Column v-if="this.style.hn.details" header="Stimmen/ Gelost" />
      <Column v-if="this.style.hn.details" header="Patt&shy;gewinn" />

      <!-- subheader sls -->
      <Column class="hidden" />
      <Column header="Sitze" />
      <Column header="Patt Auf&shy;lösung" />

      <Column class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="key" :header="':' + q" />
      <Column class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.rangDetails)" :key="key" :header="'R' + q" />
      <Column class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.sitzeDetails)" :key="key" :header="'SP' + q" />

      <Column class="centered" v-if="this.style.sls.details" header="Patt?" />
      <Column class="right" v-if="this.style.sls.details && this.style.sls.pattDetails" header="Los Chance" />
      <Column class="right" v-if="this.style.sls.details && this.style.sls.pattDetails" header="Stimmen Gelost" />
      <Column class="centered" v-if="this.style.sls.details && this.style.sls.pattDetails" header="Patt&shy;gewinn" />
      <Column class="centered" v-if="this.style.sls.details" header="QK verletzt" />
    </Row>
  </ColumnGroup>

  <Column field="name">
    <template #body="slotProps">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <Button icon="pi pi-pencil" severity="secondary" rounded outlined aria-label="Bearbeiten" />
        <Button icon="pi pi-trash" severity="secondary" rounded outlined aria-label="Löschen" @click="deleteItem(slotProps.data.id)" />
        <span>{{ slotProps.data.name }}</span>
      </div>
    </template>
  </Column>
  <Column field="sitzeHauptorgan" />
  <Column field="ag" />
  <Column field="proporzgenaueZahlAusschuss">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.proporzgenaueZahlAusschuss" :max="data.helper.maxProporzgenaueZahlAusschuss" :decimals="2" />
    </template>
  </Column>
  <Column>
    <template #body="slotProps">
      {{ formatYesNo(slotProps.data.sicherVertreten) }}
    </template>
  </Column>
  <Column field="quotenKriterium" />
  <Column>
    <template #body>
      <div>
        {{ formatOkNok(true) }}
      </div>
    </template>
  </Column>

  <Column field="sls.qkVerletzt" class="no-pad">
    <template #body="slotProps">
      <div class="cell-pad" :class="slotProps.data.sls.qkVerletzt ? 'false' : ''">
        {{ formatOkNok(!slotProps.data.sls.qkVerletzt) }}
      </div>
    </template>
  </Column>
  <Column field="dh.qkVerletzt" class="no-pad">
    <template #body="slotProps">
      <div class="cell-pad" :class="slotProps.data.dh.qkVerletzt ? 'false' : ''">
        {{ formatOkNok(!slotProps.data.dh.qkVerletzt) }}
      </div>
    </template>
  </Column>

  <!-- body hn -->
  <Column class="hidden" />
  <Column field="hn.sitze">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.hn.sitze" :max="data.helper.hn.maxSitze" colour="green" />
    </template>
  </Column>
  <Column field="hn.sitze">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.hn.pattaufloesung" :max="data.helper.hn.maxPattaufloesung" :decimals="2" colour="yellow" />
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.sitzeGanz">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.hn.sitzeGanz" :max="data.helper.hn.maxSitzeGanz" />
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.sitzeRest">
    <template #body="slotProps">
      {{ formatDecimal(slotProps.data.hn.sitzeRest, 4) }}
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.rangRest">
    <template #body="slotProps">
      {{ formatRank(slotProps.data.hn.rangRest) }}
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.restsitz" />
  <Column v-if="this.style.hn.details" field="hn.patt">
    <template #body="slotProps">
      {{ formatYesNo(slotProps.data.hn.patt) }}
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.losChance">
    <template #body="slotProps">
      {{ formatPercent(slotProps.data.hn.losChance) }}
    </template>
  </Column>
  <Column v-if="this.style.hn.details" field="hn.stimmenGelost" />
  <Column v-if="this.style.hn.details" field="hn.pattgewinn">
    <template #body="slotProps">
      {{ formatYesNo(slotProps.data.hn.pattgewinn) }}
    </template>
  </Column>

  <!-- body sls -->
  <Column class="hidden" />
  <Column field="sls.sitzeGesamt">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.sls.sitzeGesamt" :max="data.helper.sls.maxSitzeGesamt" colour="green" />
    </template>
  </Column>
  <Column field="sls.pattaufloesung">
    <template #body="slotProps">
      <DataBar :current="slotProps.data.sls.pattaufloesung" :max="data.helper.sls.maxPattaufloesung" colour="yellow" />
    </template>
  </Column>
  <template>
    <div>
      {{ data }}
    </div>
    <!-- <Column class="right" field="sls.quotienten" style="height: 1px;">
      <div style="display: flex; height: 100%;">
        <td v-for="[q, value] in dataView(data.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="q"
          style="flex: 1; height: 100%; min-width: 3.5rem; align-content: center; text-align: right;"
        >
          {{ formatDecimal(value, 2) }}
        </td>
      </div>
    </Column> -->
  </template>

  <!-- <Column class="right" field="sls.quotienten" style="height: 1px;">
    <template #body="{data}">
      <div style="display: flex; height: 100%;">
        <td v-for="[q, value] in dataView(data.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="q"
          style="flex: 1; height: 100%; min-width: 3.5rem; align-content: center; text-align: right;"
        >
          {{ formatDecimal(value, 2) }}
        </td>
      </div>
    </template>
  </Column> -->

  <!-- <Column class="right" field="sls.quotienten" style="height: 1px;">
    <template #body="{data}">
      <div style="display: flex; height: 100%;">
        <td class="right" v-for="[q, value] in dataView(data.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="q"
          style="flex: 1; height: 100%; min-width: 3rem; vertical-align: middle;"
        >
          {{ formatDecimal(value, 2) }}
        </td>
      </div>
    </template>
  </Column> -->

  <!-- 

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
      </td> -->
  

  <ColumnGroup type="footer">
    <Row>
      <Column footer="Summe" />
      <Column class="no-pad">
        <template #footer>
          <div class="cell-pad" :class="summeHauptorganKorrekt">
            {{ data.ergebnisse.summeSitzeHauptorgan }}
          </div>
        </template>
      </Column>
      <Column />
      <Column :footer="data.ergebnisse.summeProporzgenaueZahlAusschuss" />
      <Column :colspan="5" />

      <!-- footer hn -->
      <Column class="hidden" />
      <Column :footer="data.ergebnisse.hn.summeSitze" />
      <Column :footer="data.ergebnisse.hn.summePattaufloesung" />
      <Column v-if="this.style.hn.details" :footer="data.ergebnisse.hn.summeSitzeGanz" />
      <Column v-if="this.style.hn.details" :footer="data.ergebnisse.hn.summeSitzeRest" />
      <Column v-if="this.style.hn.details" />
      <Column v-if="this.style.hn.details" :footer="data.ergebnisse.hn.summeRestsitze" />
      <Column v-if="this.style.hn.details" :footer="data.ergebnisse.hn.summePatt" />
      <Column v-if="this.style.hn.details" :footer="data.ergebnisse.hn.summeLosChance" />
      <Column v-if="this.style.hn.details" />
      <Column v-if="this.style.hn.details" />

      <!-- footer sls -->
      <Column class="hidden" />
      <Column :footer="data.ergebnisse.sls.summeSitzeGesamt" />
      <Column :footer="data.ergebnisse.sls.summePattaufloesung" />

      <Column v-if="this.style.sls.details" :colspan="this.style.sls.quotientenDetails === true ? 19 : 1" />
      <Column v-if="this.style.sls.details" :colspan="this.style.sls.rangDetails === true ? 19 : 1" />
      <Column v-if="this.style.sls.details" :colspan="this.style.sls.sitzeDetails === true ? 19 : 1" />
      <Column v-if="this.style.sls.details" :footer="data.ergebnisse.sls.summePatt" />
      <Column v-if="this.style.sls.details && this.style.sls.pattDetails" :footer="data.ergebnisse.sls.summeLosChance"  />
      <Column v-if="this.style.sls.details && this.style.sls.pattDetails" />
      <Column v-if="this.style.sls.details && this.style.sls.pattDetails" />
      <Column v-if="this.style.sls.details" :footer="data.ergebnisse.sls.summeQkVerletzt" />
    </Row>
  </ColumnGroup>
</DataTable>

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

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.quotientenDetails)" :key="key">
        :{{ q }}
      </th>

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.rangDetails)" :key="key">
        R{{ q }}
      </th>

      <th class="right" v-for="(q, key) in subHeaderView(data.helper.sls.quotienten, this.style.sls.details, this.style.sls.sitzeDetails)" :key="key">
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
        <DataBar :current="entry.sls.sitzeGesamt" :max="data.helper.sls.maxSitzeGesamt" />
      </td>
      <td>
        <DataBar :current="entry.sls.pattaufloesung" :max="data.helper.sls.maxPattaufloesung" />
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
      <td>{{ data.ergebnisse.sls.summeSitzeGesamt }}</td>
      <td>{{ data.ergebnisse.sls.summePattaufloesung }}</td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.quotientenDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.rangDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details" :colspan="this.style.sls.sitzeDetails === true ? 19 : 1"></td>
      <td v-if="this.style.sls.details">{{ data.ergebnisse.sls.summePatt }}</td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails">{{ data.ergebnisse.sls.summeLosChance }}</td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails"></td>
      <td v-if="this.style.sls.details && this.style.sls.pattDetails"></td>
      <td v-if="this.style.sls.details">{{ data.ergebnisse.sls.summeQkVerletzt }}</td>
    </tr>
  </tfoot>
</table>
</template>

<style>
@import url("../assets/css/theme-colours.css");

.hidden {
  width: 1rem;
  background-color: var(--surface-overlay);
  border-top: none;
  border-bottom: none;
}

.th-empty-top-right-corner {
  border-top: none;
  border-right: none;
  border-bottom: none;
}

.no-pad {
  padding: 0;
}

.cell-pad {
  padding: 0.375rem 0.5rem;
}

.centered {
  text-align: center;
}

.correct {
  background-color: var(--green-400);
}

.false {
  background-color: var(--red-500);
}

td[data-pc-section="footercell"] {
  text-align: right;
}

td .right {
  text-align: right !important;
}

.header-hn {
  background-color: var(--highlight-hn);
}

.header-sls {
  background-color: var(--highlight-sls);
}

.header-dh {
  background-color: var(--highlight-dh);
}
</style>
