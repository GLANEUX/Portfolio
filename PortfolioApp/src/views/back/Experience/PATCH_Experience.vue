<template>
  <div>
    <h1>Modifier la experience</h1>
    <form @submit.prevent="submitForm">
      <label for="company">Nom :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété company -->
      <input type="text" id="company" v-model="company" required>
      <label for="details">details :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété company -->
      <input type="text" id="details" v-model="details" required>
      <label for="job_title">job_title :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété company -->
      <input type="text" id="job_title" v-model="job_title" required>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button
          v-for="skill in skills"
          :key="skill._id"
          :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)"
          :value="skill._id"
          type="button"
        >
          {{ skill.name }}
        </button>
      </div>

      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToExperienceList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
    </form>
    <!-- Affichage du message et du bouton de retour à la liste -->
    <div v-if="showSuccessMessage">
      <p>{{ successMessage }}</p>
      <button @click="redirectToExperienceList">Retour à la liste</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js";

export default {
  data() {
    return {
      originalCompany: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
      company: "", // Champ pour stocker le nom de la catégorie de compétences
      originalDetails: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
      details: "", // Champ pour stocker le nom de la catégorie de compétences
      job_title: "", 
      selectedSkills: [], // Skills de compétences sélectionnées
      skills: [], // Liste des skills de compétences      
      showSuccessMessage: false, // Boolean pour contrôler l'affichage du message de succès
      successMessage: "" // Message de succès à afficher
    };
  },
  async created() {
        // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkills();
    // Récupération de l'ID de la catégorie depuis l'URL
    this.experienceId = this.$route.params.id;


    if (this.selectedSkills.length === 0) {
      // S'il n'y a pas de catégories sélectionnées, définir selectedCategories comme un tableau vide pour éviter les cases à cocher sélectionnées
      this.selectedSkills  = [];
    }
    // Charger les détails de la catégorie depuis l'API
    this.loadExperience();
  },
  methods: {
    async loadSkills() {
      try {
        // Envoi de la requête GET pour récupérer la liste des skills de compétences
        const response = await axios.get(`${config.apiUrl}/skills`);
        // Stockage des skills de compétences dans la propriété skills
        this.skills = response.data;
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des skills de compétences :", error);
      }
    },
    toggleSkill(skillId) {
      // Vérifier si la catégorie est déjà sélectionnée
      if (this.isSelected(skillId)) {
        // Si la catégorie est déjà sélectionnée, la supprimer de la liste des catégories sélectionnées
        this.selectedSkills = this.selectedSkills.filter(id => id !== skillId);
      } else {
        // Sinon, ajouter la catégorie à la liste des catégories sélectionnées
        this.selectedSkills.push(skillId);
      }
    },
    isSelected(skillId) {
      // Vérifier si la catégorie est déjà sélectionnée
      return this.selectedSkills.includes(skillId);
    },
    async loadExperience() {
      try {
        // Effectuer une requête GET pour récupérer les détails de la catégorie
        const response = await axios.get(`${config.apiUrl}/experience/${this.experienceId}`);
        // Mettre à jour la valeur de company avec le nom de la catégorie récupérée
        this.company = response.data.company;
        this.originalCompany = response.data.company; // Stocker le nom d'origine
        this.details = response.data.details;
        this.originalDetails = response.data.details; // Stocker le nom d'origine     
        this.job_title = response.data.job_title;
        this.originalJob_title = response.data.job_title; // Stocker le nom d'origine     
        if (response.data.skills !== null) {
          this.selectedSkills = response.data.skills;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la experience :", error);
      }
    },
    async submitForm() {
      try {
        // Envoi de la requête PATCH pour modifier la catégorie de compétences
        await axios.patch(`${config.apiUrl}/experience/${this.experienceId}`, {
          company: this.company,
          details: this.details,
          job_title: this.job_title,
          skills: this.selectedSkills
        });
        // Afficher le message de succès et le bouton de retour à la liste
        this.showSuccessMessage = true;
        this.successMessage = `"${this.originalCompany}" modifié`;
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.showSuccessMessage = false;
          // Redirection vers la page des catégories de compétences après 3 secondes
          this.redirectToExperienceList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la modification de la catégorie de compétences :", error);
      }
    },
    resetForm() {
      // Réinitialiser le champ company avec le nom d'origine
      this.company = this.originalCompany;
      this.details = this.originalDetails;
      this.job_title = this.originalJob_title;
    },
    redirectToExperienceList() {
      // Redirection vers la page des catégories de compétences
      this.$router.push('/get-experiences');
    }
  }
};
</script>

<style>
/* Styles CSS facultatifs pour le formulaire */
input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
}
</style>
