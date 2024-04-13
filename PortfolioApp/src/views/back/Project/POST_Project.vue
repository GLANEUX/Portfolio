<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="name">Name :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="shortDescription">shortDescription :</label>
      <input type="text" id="shortDescription" v-model="shortDescription" required>
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details" required>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button v-for="skill in skills" :key="skill._id" :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)" type="button">
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
      <button @click="redirectToProjectList">Voir la liste des skills</button>
      <button @click="addNewProject">Ajouter une nouvelle skill</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      name: "", // Champ pour stocker le nom de la skill de compétences
      details: "", // Champ pour stocker le nom de la skill de compétences
      shortDescription: "",
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
        // Envoi de la requête POST pour ajouter une nouvelle project
        const response = await axios.post(`${config.apiUrl}/project`, {
          name: this.name,
          details: this.details,
          shortDescription: this.shortDescription,
          skills: this.selectedSkills
        });

        // Affichage du succès
        this.success = "Nouvelle project ajoutée : " + response.data.name;

        // Réinitialisation du champ "name" après l'ajout
        this.name = "";
        this.details = "";
        this.shortDescription = "";
        this.selectedSkills = [];
        // Effacer les messages d'erreur précédents
        this.error = null;
        //  Redirection automatique vers la liste des compétences après 3 secondes
        setTimeout(() => {
          this.redirectToProjectList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la project : " + error.response.data.error;

        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToProjectList() {
      // Redirection vers la liste des skills de compétences
      this.$router.push('/get-projects');
    },
    addNewProject() {
      // Réinitialiser le formulaire pour ajouter une nouvelle skill
      this.success = null; // Effacer le message de succès
      this.error = null; // Effacer les erreurs
      this.name = ""; // Réinitialiser le champ de nom
      this.shortDescription = "";
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