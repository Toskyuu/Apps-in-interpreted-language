import { createApp } from 'vue'
import mitt from 'mitt'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import underscore from 'underscore'

const emitter = mitt();
const app = createApp(App).use(underscore);

app.config.globalProperties.emitter = emitter;
app.mount('#app');