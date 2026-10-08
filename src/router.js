import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/states/authStore';
import AuthLayout from '@/features/auth/layouts/AuthLayout.vue';
import LoginPage from '@/features/auth/pages/LoginPage.vue';
import RegisterPage from '@/features/auth/pages/RegisterPage.vue';
import AucationLayout from '@/features/aucations/layouts/AucationLayout.vue';
import HomePage from '@/features/aucations/pages/HomePage.vue';
import DetailPage from '@/features/aucations/pages/DetailPage.vue';
import UsersPage from '@/features/users/pages/UsersPage.vue';
import ProfilePage from '@/features/users/pages/ProfilePage.vue';
import NotFoundPage from '@/features/common/pages/NotFoundPage.vue';

export const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { guestOnly: true },
    children: [
      { path: 'login', name: 'login', component: LoginPage },
      { path: 'register', name: 'register', component: RegisterPage },
    ],
  },
  {
    path: '/',
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: 'aucations/:aucationId', name: 'aucation-detail', component: DetailPage },
      { path: 'users', name: 'users', component: UsersPage },
      { path: 'profile', name: 'profile', component: ProfilePage },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
];

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes });

  router.beforeEach((to) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
      return { name: 'home' };
    }
    return true;
  });

  return router;
}

const router = createAppRouter();
export default router;
