<script>
import Button from "primevue/button"
import Tag from "primevue/tag"

import DataBar from "./DataBar.vue"
import EditDialog from "./EditDialog.vue"

import * as fmt from "@/utils/formatter.js"

import { useState } from "@/store/index.js"
import { sitzStatus, quotientenVerfahrenTabelle } from "@/store/enums.js"

export default {
  name: 'ParteiDaten',
  props: {
    ohneAg: Boolean
  },
  setup() {
    const { deleteItem, clear, loadDefaults, neuePartei, updateItem, data, startConfig } = useState()
    return {
      fmt,
      deleteItem, clear, loadDefaults, neuePartei, updateItem, completeData: data, startConfig,
      quotientenVerfahrenTabelle
    }
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
        },
        dh: {
          details: false,
          quotientenDetails: false,
          rangDetails: false,
          sitzeDetails: false,
          pattDetails: false
        }
      },
      editDialogVisible: false,
      editDialogNew: true,
    }
  },
  computed: {
    data() {
      return this.ohneAg ? this.completeData["ohneAG"] : this.completeData["mitAG"]
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
    headerClass(verfahren) {
      return `header-${verfahren}`
    },
    styleSitzeQuotienten(value) {
      switch (value) {
        case sitzStatus.SITZ: return 'correct'
        case sitzStatus.PATT: return 'patt'
        default: return ''
      }
    },
    showNewDialog() {
      this.$refs.dialog.setData(this.neuePartei("", 0))
      this.editDialogNew = true
      this.editDialogVisible = true
    },
    showEditDialog(partei) {
      const copy = Object.assign({}, partei)
      this.$refs.dialog.setData(copy)
      this.editDialogNew = false
      this.editDialogVisible = true
    },
  },
  components: { Button, DataBar, EditDialog, Tag }
}
</script>

<template>
<table>
  <thead class="header-info">
    <tr class="bold centered">
      <!-- Header Info -->
      <th :colspan="ohneAg ? 3 : 2">
        Zusammensetzung Hauptorgan<br>({{ this.ohneAg ? "ohne" : "mit" }} Ausschussgemeinschaften)
      </th>
      <th :colspan="ohneAg ? 2 : 1">
        Info
      </th>
      <th colspan="4">
        Zulässigkeit Verfahren
      </th>
      <th v-show="!ohneAg" colspan="3">
        Verlust letzter Sitz?
      </th>

      <!-- Header HN -->
      <th class="hidden"></th>
      <th class="header-hn relative" colspan="2">
        <button class="expand-button" @click="style.hn.details = !style.hn.details">{{ this.style.hn.details ? "-" : "+" }}</button>
        Hare/Niemeyer
      </th>
      <th class="th-empty-top-right-corner" colspan="8" v-show="this.style.hn.details"></th>
      
      <!-- Header SLS + Header dH -->
      <template v-for="{ dataKey, name } of quotientenVerfahrenTabelle" :key="dataKey">
        <th class="hidden"></th>
        <th class="relative" :class="headerClass(dataKey)" colspan="2">
          <div>
            <button class="expand-button" @click="style[dataKey].details = !style[dataKey].details">{{ this.style[dataKey].details ? "-" : "+" }}</button>
            <span v-html="name"></span>
          </div>
        </th>
        <th class="relative" :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].quotientenDetails === true ? 19 : 1">
          <button class="expand-button" @click="style[dataKey].quotientenDetails = !style[dataKey].quotientenDetails">{{ this.style[dataKey].quotientenDetails ? "-" : "+" }}</button>
          Quotienten
        </th>
        <th class="relative" :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].rangDetails === true ? 19 : 1">
          <button class="expand-button" @click="style[dataKey].rangDetails = !style[dataKey].rangDetails">{{ this.style[dataKey].rangDetails ? "-" : "+" }}</button>
          Rangzahlen
        </th>
        <th class="relative" :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].sitzeDetails === true ? 19 : 1">
          <button class="expand-button" @click="style[dataKey].sitzeDetails = !style[dataKey].sitzeDetails">{{ this.style[dataKey].sitzeDetails ? "-" : "+" }}</button>
          Sitze
        </th>
        <th class="relative" :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].pattDetails === true ? 4 : 1">
          <button class="expand-button" @click="style[dataKey].pattDetails = !style[dataKey].pattDetails">{{ this.style[dataKey].pattDetails ? "-" : "+" }}</button>
          Patt
        </th>
        <th :class="headerClass(dataKey)" v-show="this.style[dataKey].details" >
          Zulässig
        </th>
      </template>

      <!-- Header Pattauflösung -->
      <th class="hidden"></th>
      <th colspan="2">
        Pattauflösung
      </th>
    </tr>
    <tr>
      <!-- Subheader Info -->
      <th>Partei/<wbr>Wählergruppe</th>
      <th>Sitze&nbsp;im Hauptorgan</th>
      <th v-show="ohneAg">AG?</th>
      <th>
        <span class="header-databar">Proporzgenaue Zahl&nbsp;Ausschuss</span>
      </th>
      <th v-show="ohneAg">Sicher vertreten?</th>
      <th>Quoten&shy;kriterium</th>
      <th class="header-hn">H/N</th>
      <th class="header-sls">SL/S</th>
      <th class="header-dh">d'H</th>
      <th v-show="!ohneAg" class="header-hn">H/N ohne</th>
      <th v-show="!ohneAg" class="header-sls">SL/S ohne</th>
      <th v-show="!ohneAg" class="header-dh">d'H ohne</th>

      <!-- Subheader HN -->
      <th class="hidden"></th>
      <th class="header-hn">
        <span class="header-databar">Sitze</span>
      </th>
      <th class="header-hn">
        <span class="header-databar">Pattauf&shy;lösung</span>
      </th>
      <th v-show="this.style.hn.details" class="header-hn">
        <span class="header-databar">S ganz</span>
      </th>
      <th v-show="this.style.hn.details" class="header-hn">S Rest</th>
      <th v-show="this.style.hn.details" class="header-hn">Rng Rest</th>
      <th v-show="this.style.hn.details" class="header-hn">Rest&shy;sitz</th>
      <th v-show="this.style.hn.details" class="header-hn">Patt</th>
      <th v-show="this.style.hn.details" class="header-hn">Los Chance</th>
      <th v-show="this.style.hn.details" class="header-hn">Stimmen/<wbr>Gelost</th>
      <th v-show="this.style.hn.details" class="header-hn">Patt&shy;gewinn</th>
      
      <!-- Subheader SLS + Subheader dH -->
      <template v-for="{ dataKey } of quotientenVerfahrenTabelle" :key="dataKey">
        <th class="hidden"></th>
        <th :class="headerClass(dataKey)">
          <span class="header-databar">Sitze</span>
        </th>
        <th :class="headerClass(dataKey)">
          <span class="header-databar">Pattauf&shy;lösung</span>
        </th>
        <th :class="headerClass(dataKey)" class="right" v-for="(q, key) in subHeaderView(data.helper[dataKey].quotienten, this.style[dataKey].details, this.style[dataKey].quotientenDetails)" :key="key">
          :{{ q }}
        </th>
        <th :class="headerClass(dataKey)" class="right" v-for="(q, key) in subHeaderView(data.helper[dataKey].quotienten, this.style[dataKey].details, this.style[dataKey].rangDetails)" :key="key">
          R{{ q }}
        </th>
        <th :class="headerClass(dataKey)" class="right" v-for="(q, key) in subHeaderView(data.helper[dataKey].quotienten, this.style[dataKey].details, this.style[dataKey].sitzeDetails)" :key="key">
          SP{{ q }}
        </th>
        <th :class="headerClass(dataKey)" class="centered" v-show="this.style[dataKey].details">Patt?</th>
        <th :class="headerClass(dataKey)" class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">Los Chance</th>
        <th :class="headerClass(dataKey)" class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">Stimmen Gelost</th>
        <th :class="headerClass(dataKey)" class="centered" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">Patt&shy;gewinn</th>
        <th :class="headerClass(dataKey)" class="centered" v-show="this.style[dataKey].details">QK verletzt</th>
      </template>

      <!-- Subheader Pattauflösung -->
      <th class="hidden"></th>
      <th>Partei/<wbr>Wählergruppe</th>
      <th>Stimmen</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="entry in data.parteien" :key="entry.id">
      <!-- Daten Info -->
      <td>
        <div class="partei-zelle">
          <Button :disabled="!ohneAg" icon="pi pi-pencil" severity="secondary" rounded outlined aria-label="Bearbeiten" @click="showEditDialog(entry)" />
          <Button :disabled="!ohneAg" icon="pi pi-trash" severity="secondary" rounded outlined aria-label="Löschen" @click="deleteItem(entry.id)" />
          <span>{{ entry.name }}</span>
        </div>
      </td>
      <td class="right">
        {{ entry.sitzeHauptorgan }}
      </td>
      <td v-show="ohneAg" :class="!entry.agMöglich && 'keine-ag'">
        {{ fmt.formatAG(entry.ag).replace(/ /g, '&nbsp;') }}
      </td>
      <td>
        <DataBar :current="entry.proporzgenaueZahlAusschuss" :max="data.helper.maxProporzgenaueZahlAusschuss" :decimals="2" />
      </td>
      <td v-show="ohneAg" class="centered">
        {{ fmt.formatYesNo(entry.sicherVertreten) }}
      </td>
      <td class="centered">
        {{ entry.quotenKriterium }}
      </td>
      <td class="centered">
        {{ fmt.formatOkNok(true) }}
      </td>
      <td class="centered" :class="entry.sls.qkVerletzt && 'false'">
        {{ fmt.formatOkNok(!entry.sls.qkVerletzt) }}
      </td>
      <td class="centered" :class="entry.dh.qkVerletzt && 'false'">
        {{ fmt.formatOkNok(!entry.dh.qkVerletzt) }}
      </td>
      <td v-show="!ohneAg" class="right" :class="entry.hn.verlustLetzterSitz && 'false'">
        {{ entry.hn.sitzeOhneAG }}
      </td>
      <td v-show="!ohneAg" class="right" :class="entry.sls.verlustLetzterSitz && 'false'">
        {{ entry.sls.sitzeOhneAG }}
      </td>
      <td v-show="!ohneAg" class="right" :class="entry.dh.verlustLetzterSitz && 'false'">
        {{ entry.dh.sitzeOhneAG }}
      </td>

      <!-- Daten HN -->
      <td class="hidden"></td>
      <td :class="entry.hn.verlustLetzterSitz && 'false'">
        <DataBar :current="entry.hn.sitze" :max="data.helper.hn.maxSitze" colour="green" />
      </td>
      <td :class="entry.hn.verlustLetzterSitz && 'false'">
        <DataBar v-if="entry.hn.patt === true" :current="entry.hn.pattaufloesung" :max="data.helper.hn.maxPattaufloesung" :decimals="2" colour="yellow" />
      </td>
      <td v-show="this.style.hn.details">
        <DataBar :current="entry.hn.sitzeGanz" :max="data.helper.hn.maxSitzeGanz" colour="green" />
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ fmt.formatDecimal(entry.hn.sitzeRest, 4) }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ entry.hn.rangRest }}.
      </td>
      <td class="right" v-show="this.style.hn.details" :class="entry.hn.restsitz > 0 && (entry.hn.patt === false ? 'correct' : 'patt')">
        {{ entry.hn.restsitz }}
      </td>
      <td class="centered" v-show="this.style.hn.details" :class="(entry.hn.patt === true && entry.hn.restsitz > 0) && 'patt'">
        {{ fmt.formatYesNo(entry.hn.patt) }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ fmt.formatPercent(entry.hn.losChance) }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ entry.hn.stimmenGelost }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ fmt.formatYesNo(entry.hn.pattgewinn) }}
      </td>

      <!-- Daten SLS + Daten dH -->
      <template v-for="{ dataKey } of quotientenVerfahrenTabelle" :key="dataKey">
        <td class="hidden"></td>
        <td :class="(entry[dataKey].qkVerletzt || (!ohneAg && entry[dataKey].verlustLetzterSitz)) && 'false'">
          <DataBar :current="entry[dataKey].sitzeGesamt" :max="data.helper[dataKey].maxSitzeGesamt" colour="green" />
        </td>
        <td :class="(entry[dataKey].qkVerletzt || (!ohneAg && entry[dataKey].verlustLetzterSitz)) && 'false'">
          <DataBar v-if="entry[dataKey].patt === true" :current="entry[dataKey].pattaufloesung" :max="data.helper[dataKey].maxPattaufloesung" colour="yellow" :decimals="2" />
        </td>
        <td class="right" v-for="[q, value] in dataView(entry[dataKey].quotienten, this.style[dataKey].details, this.style[dataKey].quotientenDetails)" :key="q"
          :class="styleSitzeQuotienten(entry[dataKey].sitze.get(q))"
        >
          {{ fmt.formatDecimal(value, 2) }}
        </td>
        <td class="right" v-for="[q, value] in dataView(entry[dataKey].raenge, this.style[dataKey].details, this.style[dataKey].rangDetails)" :key="q"
          :class="styleSitzeQuotienten(entry[dataKey].sitze.get(q))"
        >
          {{ value }}.
        </td>
        <td class="right" v-for="[q, value] in dataView(entry[dataKey].sitze, this.style[dataKey].details, this.style[dataKey].sitzeDetails)" :key="q"
          :class="styleSitzeQuotienten(value)"
        >
          {{ value }}
        </td>
        <td class="centered" v-show="this.style[dataKey].details" :class="entry[dataKey].patt === true && 'patt'">
          {{ fmt.formatYesNo(entry[dataKey].patt) }}
        </td>
        <td class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ fmt.formatPercent(entry[dataKey].losChance) }}
        </td>
        <td class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ entry[dataKey].stimmenGelost }}
        </td>
        <td class="centered" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ fmt.formatYesNo(entry[dataKey].pattgewinn) }}
        </td>
        <td class="centered" v-show="this.style[dataKey].details">
          {{ fmt.formatYesNo(entry[dataKey].qkVerletzt) }}
        </td>
      </template>

      <!-- Daten Pattauflösung -->
      <td class="hidden"></td>
      <td>{{ entry.name }}</td>
      <td class="right">{{ entry.stimmen }}</td>
    </tr>

    <!-- Button Partei hinzufügen -->
    <tr>
      <td colspan="2">
        <Button :disabled="!ohneAg" type="button" severity="secondary" label="neue Partei" icon="pi pi-plus" @click="showNewDialog" outlined rounded />
      </td>
    </tr>
  </tbody>
  <tfoot class="bold header-info">
    <tr class="bold right">
      <!-- Footer Info -->
      <td class="left">Summe</td>
      <td :class="this.data.ergebnisse.summeSitzeHauptorgan == this.startConfig.sitzeHauptorgan ? 'correct' : 'false'">
        {{ data.ergebnisse.summeSitzeHauptorgan }}
      </td>
      <td v-show="ohneAg"></td>
      <td>
        {{ fmt.formatDecimal(data.ergebnisse.summeProporzgenaueZahlAusschuss) }}
      </td>
      <td :colspan="ohneAg ? 5 : 4"></td>
      <td v-show="!ohneAg" colspan="3"></td>

      <!-- Footer HN -->
      <td class="hidden"></td>
      <td>{{ data.ergebnisse.hn.summeSitze }}</td>
      <td :class="data.ergebnisse.hn.summeSitzeMitPatt != startConfig.sitzeAusschuss && 'false'">
        {{ data.ergebnisse.hn.summePattaufloesung }}
      </td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.hn.summeSitzeGanz }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.hn.summeSitzeRest }}</td>
      <td v-show="this.style.hn.details"></td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.hn.summeRestsitze }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.hn.summePatt }}</td>
      <td v-show="this.style.hn.details">{{ data.ergebnisse.hn.summeLosChance }}</td>
      <td v-show="this.style.hn.details"></td>
      <td v-show="this.style.hn.details"></td>

      <!-- Footer SLS + Footer dH-->
      <template v-for="{ dataKey } of quotientenVerfahrenTabelle" :key="dataKey">
        <td class="hidden"></td>
        <td>{{ data.ergebnisse[dataKey].summeSitzeGesamt }}</td>
        <td :class="data.ergebnisse[dataKey].summeSitzeMitPatt != startConfig.sitzeAusschuss && 'false'">
          {{ data.ergebnisse[dataKey].summePattaufloesung }}
        </td>
        <td v-show="this.style[dataKey].details" :colspan="this.style[dataKey].quotientenDetails === true ? 19 : 1"></td>
        <td v-show="this.style[dataKey].details" :colspan="this.style[dataKey].rangDetails === true ? 19 : 1"></td>
        <td v-show="this.style[dataKey].details" :colspan="this.style[dataKey].sitzeDetails === true ? 19 : 1"></td>
        <td v-show="this.style[dataKey].details">{{ data.ergebnisse[dataKey].summePatt }}</td>
        <td v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">{{ data.ergebnisse[dataKey].summeLosChance }}</td>
        <td v-show="this.style[dataKey].details && this.style[dataKey].pattDetails"></td>
        <td v-show="this.style[dataKey].details && this.style[dataKey].pattDetails"></td>
        <td v-show="this.style[dataKey].details">{{ data.ergebnisse[dataKey].summeQkVerletzt }}</td>
      </template>

      <!-- Footer Pattauflösung -->
      <th class="hidden"></th>
      <th></th>
      <th>{{ data.ergebnisse.summeStimmen }}</th>
    </tr>

    <!-- Footerzeile für "Schritte"-Info -->
    <tr v-show="ohneAg" class="schritte-reihe">
      <td colspan="2" class="right">
        <Tag severity="info" value="Schritt 1b" />
      </td>
      <td>
        <Tag severity="info" value="3a" />
      </td>
      <td colspan="150" class="right">
        <Tag severity="info" value="Schritt 1c" />
      </td>
    </tr>
  </tfoot>
</table>

<EditDialog v-model:isVisible="editDialogVisible" :isNew="editDialogNew" ref="dialog" @update-item="updateItem" />
</template>

<style>
@import url("../assets/css/theme-colours.css");

table {
  border-collapse: collapse;
  font-size: 11pt;
}

td, th {
  padding: 6px;
}

thead th, tfoot td {
  border: 1px solid var(--table-row-odd);
}

table tbody td {
  border-width: 0 2px;
  border-style: solid;
  border-color: var(--table-row-odd);
}

table tbody tr:nth-child(odd) {
  background-color: var(--table-row-odd);
}

.header-databar {
  display: block;
  min-width: 5rem;
}

.partei-zelle {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.partei-zelle Button {
  flex-shrink: 0;
}

.partei-zelle > span {
  min-width: 12em;
}

.schritte-reihe {
  background-color: Canvas;
}

.relative {
  position: relative;
}

.expand-button {
  position: absolute;
  left: 0;
  top: 0;
  border: none;
  background-color: transparent;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.hidden {
  width: 1rem;
  background-color: Canvas;
  border: none;
}

.th-empty-top-right-corner {
  background-color: Canvas;
  border: none;
}

.cell-pad {
  padding: 0.375rem 0.5rem;
}

.left {
  text-align: left;
}

.centered {
  text-align: center;
}

.right {
  text-align: right;
}

.bold {
  font-weight: bold;
}

.correct {
  background-color: var(--green-400);
}

.patt {
  background-color: var(--yellow-400);
}

.false {
  background-color: var(--red-500);
}

.keine-ag {
  background-clip: content-box;
  background-color: var(--surface-200);
}

.header-info {
  background-color: var(--surface-300);
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
