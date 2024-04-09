import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

import Ausschusskalkulator from './views/Ausschusskalkulator.vue'
import Startseite from './views/Startseite.vue'

const routes = [
    {
        path: '/',
        name: 'Startseite',
        icon: 'pi pi-home',
        component: Startseite
    },
    {
        path: '/kalkulator',
        name: 'Ausschusskalkulator',
        icon: 'pi pi-calculator',
        component: Ausschusskalkulator
    }
]

const routerMode = process.env.VUE_APP_BUILD_MODE === 'offline'
    ? createWebHashHistory(process.env.BASE_URL)
    : createWebHistory(process.env.BASE_URL)

const router = createRouter({
    history: routerMode,
    routes
})

export {
    router as default,
    routes
}
