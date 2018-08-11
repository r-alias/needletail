import Vue from 'vue'
import axios from 'axios'
import App from './App'
import Screenshot from './Screenshot'
import 'bulma/css/bulma.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
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
