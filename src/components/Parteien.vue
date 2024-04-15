<script>
import Button from "primevue/button"
import TabMenu from "primevue/tabmenu"

import DataBar from "./DataBar.vue"
import EditDialog from "./EditDialog.vue"

import { useState } from "@/store/index.js"
import { agTabs, sitzStatus, quotientenVerfahrenTabelle } from "@/store/enums"

export default {
  name: 'ParteiDaten',
  setup() {
    const { deleteItem, clear, loadDefaults, neuePartei, updateItem, data, startConfig } = useState()
    return { deleteItem, clear, loadDefaults, neuePartei, updateItem, completeData: data, startConfig, agTabs, quotientenVerfahrenTabelle }
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
      activeTab: 0,
      editDialogVisible: false,
      editDialogNew: true,
    }
  },
  computed: {
    ohneAg() {
      return this.activeTab === 0
    },
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
      this.$refs.dialog.setData(this.neuePartei())
      this.editDialogNew = true
      this.editDialogVisible = true
    },
    showEditDialog(partei) {
      const copy = Object.assign({}, partei)
      this.$refs.dialog.setData(copy)
      this.editDialogNew = false
      this.editDialogVisible = true
    },
    formatAG(value) {
      return value ? `AG ${value}` : ""
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
  components: { Button, DataBar, EditDialog, TabMenu }
}
</script>

<template>
<TabMenu v-model:activeIndex="activeTab" :model="agTabs" style="width: max-content;" />

<table>
  <thead class="header-info">
    <tr class="bold centered">
      <!-- Header Info -->
      <th :colspan="ohneAg ? 3 : 2">
        Zusammensetzung Hauptorgan<br>({{ this.ohneAg ? "ohne" : "mit" }} Ausschussgemeinschaften)
      </th>
      <th colspan="2">
        Info
      </th>
      <th colspan="4">
        Zulässigkeit Verfahren
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
        <th :class="headerClass(dataKey)" colspan="2">
          <div>
            <button class="hand" @click="style[dataKey].details = !style[dataKey].details">{{ this.style[dataKey].details ? "-" : "+" }}</button>
            <span v-html="name"></span>
          </div>
        </th>
        <th :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].quotientenDetails === true ? 19 : 1">
          <button class="hand" @click="style[dataKey].quotientenDetails = !style[dataKey].quotientenDetails">{{ this.style[dataKey].quotientenDetails ? "-" : "+" }}</button>
          Quotienten
        </th>
        <th :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].rangDetails === true ? 19 : 1">
          <button class="hand" @click="style[dataKey].rangDetails = !style[dataKey].rangDetails">{{ this.style[dataKey].rangDetails ? "-" : "+" }}</button>
          Rangzahlen
        </th>
        <th :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].sitzeDetails === true ? 19 : 1">
          <button class="hand" @click="style[dataKey].sitzeDetails = !style[dataKey].sitzeDetails">{{ this.style[dataKey].sitzeDetails ? "-" : "+" }}</button>
          Sitze
        </th>
        <th :class="headerClass(dataKey)" v-show="this.style[dataKey].details" :colspan="this.style[dataKey].pattDetails === true ? 4 : 1">
          <button class="hand" @click="style[dataKey].pattDetails = !style[dataKey].pattDetails">{{ this.style[dataKey].pattDetails ? "-" : "+" }}</button>
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
      <th>Sitze im Haupt&shy;organ</th>
      <th v-show="ohneAg">AG?</th>
      <th>Proporz&shy;genaue Zahl Ausschuss</th>
      <th>Sicher vertreten?</th>
      <th>Quoten&shy;kriterium</th>
      <th class="header-hn">H/N</th>
      <th class="header-sls">SL/S</th>
      <th class="header-dh">d'H</th>

      <!-- Subheader HN -->
      <th class="hidden"></th>
      <th class="header-hn">Sitze</th>
      <th class="header-hn">Patt Auf&shy;lösung</th>
      <th v-show="this.style.hn.details" class="header-hn">S ganz</th>
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
        <th :class="headerClass(dataKey)">Sitze</th>
        <th :class="headerClass(dataKey)">Patt Auf&shy;lösung</th>
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
        <div style="display: flex; align-items: center; gap: 6px;">
          <Button :disabled="!ohneAg" icon="pi pi-pencil" severity="secondary" rounded outlined aria-label="Bearbeiten" @click="showEditDialog(entry)" />
          <Button :disabled="!ohneAg" icon="pi pi-trash" severity="secondary" rounded outlined aria-label="Löschen" @click="deleteItem(entry.id)" />
          {{ entry.name }}
        </div>
      </td>
      <td class="right">
        {{ entry.sitzeHauptorgan }}
      </td>
      <td v-show="ohneAg" :class="!entry.agMöglich ? 'keine-ag' : ''">
        {{ formatAG(entry.ag).replace(/ /g, '&nbsp;') }}
      </td>
      <td>
        <DataBar :current="entry.proporzgenaueZahlAusschuss" :max="data.helper.maxProporzgenaueZahlAusschuss" :decimals="2" />
      </td>
      <td class="centered">
        {{ formatYesNo(entry.sicherVertreten) }}
      </td>
      <td class="centered">
        {{ entry.quotenKriterium }}
      </td>
      <td class="centered">
        {{ formatOkNok(true) }}
      </td>
      <td class="centered" :class="entry.sls.qkVerletzt ? 'false' :''">
        {{ formatOkNok(!entry.sls.qkVerletzt) }}
      </td>
      <td class="centered" :class="entry.dh.qkVerletzt ? 'false' : ''">
        {{ formatOkNok(!entry.dh.qkVerletzt) }}
      </td>

      <!-- Daten HN -->
      <td class="hidden"></td>
      <td>
        <DataBar :current="entry.hn.sitze" :max="data.helper.hn.maxSitze" colour="green" />
      </td>
      <td>
        <DataBar v-if="entry.hn.patt === true" :current="entry.hn.pattaufloesung" :max="data.helper.hn.maxPattaufloesung" :decimals="2" colour="yellow" />
      </td>
      <td v-show="this.style.hn.details">
        <DataBar :current="entry.hn.sitzeGanz" :max="data.helper.hn.maxSitzeGanz" colour="green" />
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ formatDecimal(entry.hn.sitzeRest, 4) }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ entry.hn.rangRest }}.
      </td>
      <td class="right" v-show="this.style.hn.details" :class="entry.hn.restsitz > 0 ? (entry.hn.patt === false ? 'correct' : 'patt') : ''">
        {{ entry.hn.restsitz }}
      </td>
      <td class="centered" v-show="this.style.hn.details" :class="entry.hn.patt === true && entry.hn.restsitz > 0 ? 'patt' : ''">
        {{ formatYesNo(entry.hn.patt) }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ formatPercent(entry.hn.losChance) }}
      </td>
      <td class="right" v-show="this.style.hn.details">
        {{ entry.hn.stimmenGelost }}
      </td>
      <td class="centered" v-show="this.style.hn.details">
        {{ formatYesNo(entry.hn.pattgewinn) }}
      </td>

      <!-- Daten SLS + Daten dH -->
      <template v-for="{ dataKey } of quotientenVerfahrenTabelle" :key="dataKey">
        <td class="hidden"></td>
        <td :class="entry[dataKey].qkVerletzt === true ? 'false' : ''">
          <DataBar :current="entry[dataKey].sitzeGesamt" :max="data.helper[dataKey].maxSitzeGesamt" colour="green" />
        </td>
        <td :class="entry[dataKey].qkVerletzt === true ? 'false' : ''">
          <DataBar v-if="entry[dataKey].patt === true" :current="entry[dataKey].pattaufloesung" :max="data.helper[dataKey].maxPattaufloesung" colour="yellow" :decimals="2" />
        </td>
        <td class="right" v-for="[q, value] in dataView(entry[dataKey].quotienten, this.style[dataKey].details, this.style[dataKey].quotientenDetails)" :key="q"
          :class="styleSitzeQuotienten(entry[dataKey].sitze.get(q))"
        >
          {{ formatDecimal(value, 2) }}
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
        <td class="centered" v-show="this.style[dataKey].details" :class="entry[dataKey].patt === true ? 'patt' : ''">
          {{ formatYesNo(entry[dataKey].patt) }}
        </td>
        <td class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ formatPercent(entry[dataKey].losChance) }}
        </td>
        <td class="right" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ entry[dataKey].stimmenGelost }}
        </td>
        <td class="centered" v-show="this.style[dataKey].details && this.style[dataKey].pattDetails">
          {{ formatYesNo(entry[dataKey].pattgewinn) }}
        </td>
        <td class="centered" v-show="this.style[dataKey].details">
          {{ formatYesNo(entry[dataKey].qkVerletzt) }}
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
        <Button type="button" severity="secondary" label="neue Partei" icon="pi pi-plus" @click="showNewDialog" outlined rounded />
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
        {{ formatDecimal(data.ergebnisse.summeProporzgenaueZahlAusschuss) }}
      </td>
      <td colspan="5"></td>

      <!-- Footer HN -->
      <td class="hidden"></td>
      <td>{{ data.ergebnisse.hn.summeSitze }}</td>
      <td>{{ data.ergebnisse.hn.summePattaufloesung }}</td>
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
        <td :class="Math.round(data.ergebnisse[dataKey].summeSitzeGesamt + data.ergebnisse[dataKey].summePattaufloesung) != startConfig.sitzeAusschuss ? 'false' : ''">
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

.relative {
  position: relative;
}

.expand-button {
  position: absolute;
  left: 0;
  top: 0;
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
