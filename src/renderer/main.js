import Vue from 'vue'

import App from './App'
import Screenshot from './Screenshot'
import 'bulma/css/bulma.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
if (location.href.match(/screenshot/)) {
  new Vue({
    components: { Screenshot },
    template: '<Screenshot/>'
  }).$mount('#screenshot')
} else {
  new Vue({
    components: { App },
    template: '<App/>'
  }).$mount('#app')
}
