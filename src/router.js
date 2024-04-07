import { createRouter, createWebHistory } from 'vue-router'

import Ausschusskalkulator from './views/Ausschusskalkulator.vue'
import Startseite from './views/Startseite.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Startseite
    },
    {
        path: '/kalkulator',
        name: 'Kalkulator',
        component: Ausschusskalkulator
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
