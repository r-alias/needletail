import Vue from 'vue'

import App from './App'
import Screenshot from './Screenshot'
import 'bulma/css/bulma.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')

new Vue({
  components: { Screenshot },
  template: '<Screenshot/>'
}).$mount('#screenshot')
