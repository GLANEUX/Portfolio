<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="company">Company :</label>
      <input type="text" id="company" v-model="company" required>
      <label for="job_title">job_title :</label>
      <input type="text" id="job_title" v-model="job_title" required>
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details" required>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button
          v-for="skill in skills"
          :key="skill._id"
          :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)"
          type="button"
        >
          {{ skill.name }}
        </button>
      </div>
      <button type="submit">Ajouter</button>
    </form>
    
    <!-- Affichage des erreurs -->
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Affichage du succès -->
    <div v-if="success" class="success">{{ success }}</div>

    <!-- Boutons après succès -->
    <div v-if="success">
      <button @click="redirectToExperienceList">Voir la liste des skills</button>
      <button @click="addNewExperience">Ajouter une nouvelle skill</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      company: "", // Champ pour stocker le nom de la skill de compétences
      details: "", // Champ pour stocker le nom de la skill de compétences
      job_title: "",
      selectedSkills: [], // Skills de compétences sélectionnées
      skills: [], // Liste des skills de compétences
      error: null, // Propriété pour stocker les erreurs
      success: null // Propriété pour stocker les succès
    };
  },
  async created() {
    // Charger la liste des skills de compétences lors de la création du composant
    await this.loadSkills();
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
    async submitForm() {
      try {
        // Envoi de la requête POST pour ajouter une nouvelle experience
        const response = await axios.post(`${config.apiUrl}/experience`, {
          company: this.company,
          details: this.details,
          job_title: this.job_title,
          skills: this.selectedSkills
        });
        
        // Affichage du succès
        this.success = "Nouvelle experience ajoutée : " + response.data.company;
        
        // Réinitialisation du champ "name" après l'ajout
        this.company = "";
        this.details = "";
        this.job_title = "";
        this.selectedSkills = [];
        // Effacer les messages d'erreur précédents
        this.error = null;
        //  Redirection automatique vers la liste des compétences après 3 secondes
         setTimeout(() => {
          this.redirectToExperienceList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la experience : " + error.response.data.error;
        
        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToExperienceList() {
      // Redirection vers la liste des skills de compétences
      this.$router.push('/get-experiences');
    },
    addNewExperience() {
      // Réinitialiser le formulaire pour ajouter une nouvelle skill
      this.success = null; // Effacer le message de succès
      this.error = null; // Effacer les erreurs
      this.company = ""; // Réinitialiser le champ de nom
      this.job_title = "";
      this.details = ""; // Réinitialiser le champ de nom
      this.selectedSkills = [];
    }
  }
};
</script>
<style>
.error {
  color: red;
}

.success {
  color: green;
}

button.selected {
  background-color: #007bff;
  color: #fff;
}
</style>