import { createApp } from 'vue'
import App from './App.vue'

import router from './router.js'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import 'primeicons/primeicons.css'

import VueDragScroller from  "vue-drag-scroller"

const app = createApp(App)

app.use(router)

app.use(PrimeVue)
app.use(ToastService)
app.directive('tooltip', Tooltip)

app.use(VueDragScroller)

app.mount('#app')
