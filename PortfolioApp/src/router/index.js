import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '../views/HomeView.vue';
import GET_SkillCategory from '../views/back/SkillCategory/GET_SkillCategorys.vue'; // Importez votre composant de formulaire
import POST_SkillCategory from '../views/back/SkillCategory/POST_SkillCategory.vue'; // Importez votre composant de formulaire
import PATCH_SkillCategory from '../views/back/SkillCategory/PATCH_SkillCategory.vue';
import GET_Skills from '../views/back/Skill/GET_Skills.vue'; // Importez votre composant de formulaire
import POST_Skill from '../views/back/Skill/POST_Skill.vue'; // Importez votre composant de formulaire
import PATCH_Skill from '../views/back/Skill/PATCH_Skill.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    {
      path: '/add-skill-category', // Chemin de votre formulaire de catégorie de compétences
      name: 'POST-skillCategory',
      component: POST_SkillCategory // Composant de formulaire de catégorie de compétences
    },
    {
      path: '/get-skill-categorys', // Chemin de votre formulaire de catégorie de compétences
      name: 'GET-SkillCategory',
      component: GET_SkillCategory // Composant de formulaire de catégorie de compétences
    },
    {
      path: '/edit-skill-category/:id',
      name: 'edit-SkillCategory',
      component: PATCH_SkillCategory
    },
    {
      path: '/add-skill', // Chemin de votre formulaire de catégorie de compétences
      name: 'POST-skill',
      component: POST_Skill // Composant de formulaire de catégorie de compétences
    },
    {
      path: '/get-skills', // Chemin de votre formulaire de catégorie de compétences
      name: 'GET-Skill',
      component: GET_Skills // Composant de formulaire de catégorie de compétences
    },
    {
      path: '/edit-skill/:id',
      name: 'edit-Skill',
      component: PATCH_Skill
    },
    
  ]
});

export default router;
