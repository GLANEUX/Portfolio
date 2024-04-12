import { createRouter, createWebHistory } from 'vue-router';
// import HomeView from '../views/HomeView.vue';
import GET_SkillCategory from '../views/back/SkillCategory/GET_SkillCategorys.vue'; // Importez votre composant de formulaire
import POST_SkillCategory from '../views/back/SkillCategory/POST_SkillCategory.vue'; // Importez votre composant de formulaire
import PATCH_SkillCategory from '../views/back/SkillCategory/PATCH_SkillCategory.vue';
import GET_Skills from '../views/back/Skill/GET_Skills.vue'; // Importez votre composant de formulaire
import POST_Skill from '../views/back/Skill/POST_Skill.vue'; // Importez votre composant de formulaire
import PATCH_Skill from '../views/back/Skill/PATCH_Skill.vue';


import GET_Certifications from '../views/back/Certification/GET_Certifications.vue'; 
import POST_Certification from '../views/back/Certification/POST_Certification.vue';
import PATCH_Certification from '../views/back/Certification/PATCH_Certification.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomeView
    // },
    {
      path: '/add-skill-category', 
      name: 'POST-skillCategory',
      component: POST_SkillCategory 
    },
    {
      path: '/get-skill-categorys', 
      name: 'GET-SkillCategorys',
      component: GET_SkillCategory 
    },
    {
      path: '/edit-skill-category/:id',
      name: 'edit-SkillCategory',
      component: PATCH_SkillCategory
    },
    {
      path: '/add-skill', 
      name: 'POST-skill',
      component: POST_Skill 
    },
    {
      path: '/get-skills', 
      name: 'GET-Skills',
      component: GET_Skills 
    },
    {
      path: '/edit-skill/:id',
      name: 'edit-Skill',
      component: PATCH_Skill
    },
    {
      path: '/add-certification', 
      name: 'POST-certification',
      component: POST_Certification
    },
    {
      path: '/get-certifications', 
      name: 'GET-certifications',
      component: GET_Certifications
    },
    {
      path: '/edit-certification/:id',
      name: 'edit-certification',
      component: PATCH_Certification
    }
  ]
});

export default router;
