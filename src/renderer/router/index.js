import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: require('@/components/editor').default
    },
    {
      path: '/list',
      name:'list',
      component:require('@/components/treeList').default
    },
    {
      path: '/refresh',
      name: 'refresh',
      component: require('@/components/refresh').default
    },
    {
      path: '/profile',
      name: 'profile',
      component: require('@/components/profile').default
    }
  ]
})
