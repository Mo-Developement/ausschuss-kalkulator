<script>
import Button from "primevue/button"
import Dropdown from "primevue/dropdown"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import OverlayPanel from "primevue/overlaypanel"
import SelectButton from "primevue/selectbutton"

import DataBar from "./DataBar.vue"

import * as fmt from "@/utils/formatter.js"

import { useState } from "@/store/prototypIndex.js"
import { agDropdownOptions, pattAufloesungEnum, sitzStatus, verfahren } from "@/store/enums"

export default {
  name: "PrototypParteiDaten",
  setup() {
    const { data, schritte, startConfig, clear, loadDefaults, randomize, addPartei, updatePartei, deleteItem } = useState()
    return {
      data, schritte, startConfig,
      clear, loadDefaults, randomize,
      addPartei, updatePartei, deleteItem,
      fmt,
      agDropdownOptions, pattAufloesungEnum, verfahren
    }
  },
  data() {
    return {
      verfahrenDetails: false,
      pattDetails: false,

      textData: '',
      numData: 0,

      activeField: '',
      selected: {
        id: null,
        property: '',
        value: null
      }
    }
  },
  methods: {
    statusClass(status) {
      if (status === sitzStatus.SITZ) return 'sitz'
      if (status === sitzStatus.PATT) return 'patt'
      return ''
    },
    showEditPanel(event, currentData, id, property) {
      this.$refs.editPanel.show(event)
      this.selected.id = id
      this.selected.property = property
      if (property === 'name' || property === 'nameNeu') {
        this.activeField = 'text'
        this.textData = currentData
      } else if (property === 'ag') {
        this.activeField = 'dd'
        this.numData = currentData
      } else {
        this.activeField = 'num'
        this.numData = currentData
      }
    },
    commitParteiUpdate(event) {
      this.updatePartei(this.selected.id, this.selected.property, this.activeField === 'text' ? this.textData : this.numData)

      this.$refs.editPanel.hide(event)
    }
  },
  components: { Button, DataBar, Dropdown, InputNumber, InputText, OverlayPanel, SelectButton }
}
</script>

<template>
<OverlayPanel ref="editPanel">
  <InputText v-model="textData" v-show="activeField === 'text'" ref="ip1" :min="0" @keydown.enter="commitParteiUpdate" />
  <InputNumber v-model="numData" v-show="activeField === 'num'" ref="ip2" @keydown.enter="commitParteiUpdate" />
  <Dropdown v-model="numData" v-show="activeField === 'dd'" @change="commitParteiUpdate" :options="agDropdownOptions" optionLabel="name" optionValue="code" show-clear aria-labelledby="ag" />
</OverlayPanel>

<div class="root">
  <table>
    <thead>
      <tr class="black">
        <th colspan="3">(1) Wahlergebnis</th>
      </tr>
      <tr>
        <th colspan="3">
          <div class="description">
            <p>
              Tagen Sie hier das amtliche Wahlergebnis ein. Wenn Sie zur Pattauflösung auf die Stimmenanzahl zurückgreifen wollen, muss diese hier auch eingetragen werden.
            </p>
            <p>
              Wählen Sie "neue Partei" um eine weitere hinzuzufügen. Durch Klick auf deren Namen/<wbr>Stimmen/<wbr>Sitze HO kann die Eigenschaft bearbeitet werden und mit Drücken der Enter-Taste im Eingabefeld bestätigt werden.
            </p>
          </div>
        </th>
      </tr>
      <tr class="black no-break">
        <th>Name</th>
        <th>Stimmen</th>
        <th>Sitze HO</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in data[schritte.START].parteien" :key="entry.id">
        <td @click="showEditPanel($event, entry.name, entry.id, 'name')" class="input">
          <div class="partei-zelle">
            <Button icon="pi pi-trash" severity="secondary" rounded outlined aria-label="Löschen" @click="deleteItem(entry.id)" />
            <span>{{ entry.name }}</span>
          </div>
        </td>
        <td @click="showEditPanel($event, entry.stimmen, entry.id, 'stimmen')" class="input right">
          {{ entry.stimmen }}
        </td>
        <td @click="showEditPanel($event, entry.sitzeHauptorgan, entry.id, 'sitzeHauptorgan')" class="input">
          <DataBar :current="entry.sitzeHauptorgan" :max="data[schritte.START].helper.maxSitzeHauptorgan" colour="blue" />
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <Button type="button" severity="secondary" label="neue Partei" icon="pi pi-plus" @click="addPartei(true)" outlined rounded />
        </td>
      </tr>
    </tbody>
    <tfoot>
      <td colspan="2"></td>
      <td>{{ data[schritte.START].ergebnisse.summeSitzeHauptorgan }}</td>
    </tfoot>
  </table>
  
  <table>
    <thead>
      <tr class="grey no-break">
        <th colspan="4">(2) Verschiebungen (opt.)</th>
        <th class="hidden"></th>
        <th colspan="3">(3) Ausschussgröße</th>
      </tr>
      <tr>
        <th colspan="4">
          <div class="description">
            <p>
              Hier können Sie Änderungen der Stärkeverhältnisse im Laufe der Wahlzeit eingetragen werden, beispielsweise Fraktions<wbr>
              wechsel oder auch Austritt und Tätigkeit als Einzelgänger. Der Name einer Partei kann auch "überschrieben" werden.<br>
              Austritte sind bei "Minus", Eintritte bei "Plus" zu definieren. Die Gesamtzahl aller Sitze muss unverändert bleiben.
            </p>
            <p>
              Analog zu Schritt 1 können neue Einzelgänger hinzugefügt, Alternativnamen vergeben und Verteilungen erfasst werden.
            </p>
          </div>
        </th>
        <th class="hidden"></th>
        <th colspan="3">
          <div class="description">
            <InputNumber v-model="startConfig.sitzeAusschuss" :min="0" suffix=" Sitze" aria-label="Ausschussgröße eingeben" />
            <p>
              Geben Sie oben die Ausschussgröße an. Die Tabelle zeigt das  Spiegelbild, das Quotenkriterium und berechnet, welche Parteien/<wbr>Gruppierungen bei der gegebenen Ausschussgröße SICHER im Ausschuss vertreten sind.
            </p>
          </div>
        </th>
      </tr>
      <tr class="grey no-break">
        <th>NameNeu</th>
        <th>Plus</th>
        <th>Minus</th>
        <th>Sitze HO</th>

        <th class="hidden"></th>
        <th>Ideal</th>
        <th>QuotKrit</th>
        <th>Sicher drin?</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in data[schritte.VERSCHIEBUNG].parteien" :key="entry.id">
        <td @click="showEditPanel($event, entry.nameNeu || entry.name, entry.originID || entry.id, 'nameNeu')" class="input">
          <div class="partei-zelle">
            <Button v-if="entry.originID === null" icon="pi pi-trash" severity="secondary" rounded outlined aria-label="Löschen" @click="deleteItem(entry.id)" />
            <span>{{ entry.nameNeu || entry.name }}</span>
          </div>
        </td>
        <td @click="showEditPanel($event, entry.sitzePlus, entry.originID || entry.id, 'sitzePlus')" class="input centered">
          {{ entry.sitzePlus !== 0 ? entry.sitzePlus : '' }}
        </td>
        <td @click="showEditPanel($event, entry.sitzeMinus, entry.originID || entry.id, 'sitzeMinus')" class="input centered">
          {{ entry.sitzeMinus !== 0 ? entry.sitzeMinus : '' }}
        </td>
        <td>
          <DataBar :current="entry.sitzeHauptorgan" :max="data[schritte.VERSCHIEBUNG].helper.maxSitzeHauptorgan" colour="blue" />
        </td>

        <td class="hidden"></td>
        <td>
          <DataBar :current="entry.proporzgenaueZahlAusschuss" :max="data[schritte.VERSCHIEBUNG].helper.maxProporzgenaueZahlAusschuss" :decimals="2" colour="green" />
        </td>
        <td class="centered no-break">{{ fmt.formatQuotenkriterium(entry.qkMin, entry.qkMax) }}</td>
        <td class="centered">{{ fmt.formatYesNo(entry.sicherDrin) }}</td>
      </tr>
      <tr>
        <td colspan="4">
          <Button type="button" severity="secondary" label="neuer Einzelgänger" icon="pi pi-plus" @click="addPartei(false)" outlined rounded />
        </td>
      </tr>
    </tbody>
    <tfoot>
      <td colspan="3"></td>
      <td :class="(data[schritte.VERSCHIEBUNG].ergebnisse.summeSitzeHauptorgan === data[schritte.START].ergebnisse.summeSitzeHauptorgan) ? 'correct' : 'false'">
        {{ data[schritte.VERSCHIEBUNG].ergebnisse.summeSitzeHauptorgan }}
      </td>
    </tfoot>
  </table>

  <table>
    <thead>
      <tr class="blue no-break">
        <th colspan="3">(4) Ausschussgemeinschaften (opt.)</th>

        <th class="hidden"></th>
        <th class="relative" :colspan="verfahrenDetails ? 10 : 4">
          <button class="expand-button" @click="verfahrenDetails = !verfahrenDetails">{{ this.verfahrenDetails ? "-" : "+" }}</button>
          <span>(5) Verfahrenswahl</span>
        </th>

        <th class="hidden"></th>
        <th class="relative" :colspan="pattDetails ? 7 : 1">
          <button class="expand-button" @click="pattDetails = !pattDetails">{{ this.pattDetails ? "-" : "+" }}</button>
          <span>(6) Pattauflösung</span>
        </th>
      </tr>
      <tr>
        <th colspan="3">
          <div class="description">
            <p>
              Alle Parteien/<wbr>Gruppierungen/<wbr>Einzelgänger, die nicht SICHER im Ausschuss vertreten sind, können hier als Mitglied einer Ausschussgemeinschaft definiert werden. Somit hat jeder, der THEORETISCH einen Ausschusssitz verlieren könnte das Recht, selbst an einer Ausschussgemeinschaft teilzunehmen.
            </p>
            <p>
              Die Auswahl der AG erfolgt durch Klick auf das zugehörige Feld der Partei und anschließende Selektion.
            </p>
          </div>
        </th>

        <th class="hidden"></th>
        <th :colspan="verfahrenDetails ? 10 : 4">
          <div class="description">
            <Dropdown aria-label="Verfahrenswahl auswählen"
              v-model="startConfig.verfahren" :options="Object.values(verfahren)"
              optionLabel="name" optionValue="dataKey" placeholder="--- Verfahren auswählen ---"
            />
            <p>
              Die Verfahren sind inspiriert von der Rechtsprechung des VGH dahingehend modifiziert, dass das Quotenkriterium zunächst als Grundvoraussetzung angenommen wird. Die Verfahren werden dann erst in zweiter Instanz herangezogen, um zu entscheiden, wer noch EINEN WEITEREN Sitz erhält.
            </p>
          </div>
        </th>

        <th class="hidden"></th>
        <th :colspan="pattDetails ? 7 : 1">
          <div class="description">
            <SelectButton aria-label="Pattauflösungsmethode wählen"
              v-model="startConfig.pattAufloesung" :options="Object.values(pattAufloesungEnum)"
              optionLabel="display" optionValue="value" :allow-empty="false"
            />
            <p>
              Zur Auflösung von Pattsituationen kann nur dann auf die Stimmenzahl zugegriffen werden, wenn ausschließlich Parteien beteiligt sind, die seit der Wahl unverändert sind (also insbesondere keine AGs). Gelost werden kann immer:
            </p>
            <Button @click="randomize" icon="pi pi-sync" label="losen" aria-label="losen" />
          </div>
        </th>
      </tr>
      <tr class="blue no-break">
        <th>Name</th>
        <th>AG</th>
        <th>Sitze HO</th>

        <th class="hidden"></th>
        <th>QuotKrit</th>
        <th v-show="verfahrenDetails">AZ d'H</th>
        <th v-show="verfahrenDetails">AZ H/N</th>
        <th v-show="verfahrenDetails">AZ SLS</th>
        <th v-show="verfahrenDetails">AZ</th>
        <th>Anspruch auf</th>
        <th v-show="verfahrenDetails">Rang</th>
        <th v-show="verfahrenDetails">Status</th>
        <th>Sitze</th>
        <th>LosCh</th>

        <th class="hidden"></th>
        <th v-show="pattDetails">Stimmen Zul</th>
        <th v-show="pattDetails">Stimmen Sitz</th>
        <th v-show="pattDetails">Stimmen Rang</th>
        <th v-show="pattDetails">Stimmenzahl</th>
        <th v-show="pattDetails">Zufall</th>
        <th v-show="pattDetails">Verlosung</th>
        <th>Pattauflösung</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in data[schritte.AG].parteien" :key="entry.id">
        <td>{{ entry.nameNeu || entry.name }}</td>
        <td @click="showEditPanel($event, entry.ag, entry.originID || entry.id, 'ag')"
          :class="(entry.sicherDrin || entry.originID === null) ? 'keine-ag' : 'input'" class="no-break">
          {{ fmt.formatAG(entry.ag) }}
        </td>
        <td>
          <DataBar :current="entry.sitzeHauptorgan" :max="data[schritte.AG].helper.maxSitzeHauptorgan" colour="blue" />
        </td>

        <td class="hidden"></td>
        <td v-if="entry.qkMax === 0" :colspan="verfahrenDetails ? 8 : 2"></td>
        <template v-else>
          <td class="centered">{{ fmt.formatQuotenkriterium(entry.qkMin, entry.qkMax) }}</td>
          <td v-show="verfahrenDetails" class="right">{{ fmt.formatDecimal(entry.az[verfahren.D_HONDT.dataKey], 4) }}</td>
          <td v-show="verfahrenDetails" class="right">{{ fmt.formatDecimal(entry.az[verfahren.HARE_NIEMEYER.dataKey], 4) }}</td>
          <td v-show="verfahrenDetails" class="right">{{ fmt.formatDecimal(entry.az[verfahren.LAGUE_SCHEPERS.dataKey], 4) }}</td>
          <td v-show="verfahrenDetails" class="right">{{ fmt.formatDecimal(entry.azAktuell, 4) }}</td>
          <td :class="statusClass(entry.status)" class="no-break">
            {{ entry.anspruch }}
          </td>
          <td v-show="verfahrenDetails" class="right">{{ fmt.formatRank(entry.rangAz) }}</td>
          <td v-show="verfahrenDetails" class="centered">{{ entry.status }}</td>
        </template>
        <td>
          <DataBar :current="entry.sitze" :max="data[schritte.AG].helper.maxSitze" colour="green" />
        </td>
        <td>
          <DataBar v-show="entry.losChance > 0" :current="entry.losChance" :max="data[schritte.AG].helper.maxLosChance" :decimals="2" colour="yellow" />
        </td>

        <td class="hidden"></td>
        <td v-show="pattDetails" class="centered">{{ fmt.formatYesNo(entry.stimmenZulaessig) }}</td>
        <td v-show="pattDetails" class="right">{{ entry.stimmenSitz }}</td>
        <td v-show="pattDetails" class="centered">{{ fmt.formatYesNo(entry.rangStimmenSitz) }}</td>
        <td v-show="pattDetails">{{ entry.stimmenZahl }}</td>
        <td v-show="pattDetails" class="right">{{ entry.losChance !== 0 ? fmt.formatDecimal(entry.zufall, 4) : '' }}</td>
        <td v-show="pattDetails" class="no-break">{{ entry.verlosung }}</td>
        <td :class="entry.pattaufloesung.startsWith('SITZ') && 'correct'" class="no-break">
          {{ entry.pattaufloesung }}
        </td>
      </tr>
    </tbody>
    <tfoot>
      <td colspan="2"></td>
      <td>{{ data[schritte.AG].ergebnisse.summeSitzeHauptorgan }}</td>

      <td class="hidden"></td>
      <td :colspan="verfahrenDetails ? 8 : 2"></td>
      <td>{{ data[schritte.AG].ergebnisse.summeSitze }}</td>
      <td>{{ data[schritte.AG].ergebnisse.summeLosChance }}</td>
    </tfoot>
  </table>
</div>
</template>

<style scoped>
.root {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

thead tr:first-of-type th {
  padding: 12px;
}

tfoot td {
  text-align: right;
}

.no-break, .no-break th {
  white-space: nowrap;
}

.description {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
  height: 300px;
  overflow-y: auto;
}

.description p {
  margin: 0;
  text-align: left;
}

.black {
  background-color: var(--gray-900);
  color: white;
}

.grey {
  background-color: var(--gray-400);
  color: white;
}

.blue {
  background-color: var(--blue-600);
  color: white;
}

.p-selectbutton {
  display: flex;
  width: max-content;
}

.input {
  cursor: cell;
  background-color: var(--yellow-100);
  color: black;
}

.sitz {
  background-color: var(--green-300);
  color: black;
}

.patt {
  background-color: var(--yellow-200);
  color: black;
}

.number-input * {
  width: 3rem;
}
</style>
