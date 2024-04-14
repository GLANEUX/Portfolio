<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="details">Details :</label>
      <input type="text" id="details" v-model="details">
      <label for="date">date</label>
      <input type="date" id="date" v-model="date" required>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <!-- Boucle sur les skills uniquement s'il y en a -->
        <button v-if="skills.length > 0" v-for="skill in skills" :key="skill._id"
          :class="{ selected: isSelected(skill._id) }" @click="toggleSkill(skill._id)" type="button">
          {{ skill.name }}
        </button>
        <!-- Affiche "Ajouter un skill" s'il n'y a aucun skill -->
        <span v-else> <router-link to="/add-skill">Ajouter un skill</router-link>
        </span>
      </div>
      <button type="submit">Ajouter</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToCertificationList">Voir la liste des certifications</button>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      name: "", // Champ pour stocker le nom de la catégorie de compétences
      details: "", // Champ pour stocker le nom de la catégorie de compétences
      error: null, // Propriété pour stocker les erreurs
      success: null, // Propriété pour stocker les succès
      selectedSkills: [],
      skills: [],
      date: ""
    };
  },
  async created() {
    // Charger la liste des skills lors de la création du composant
    await this.loadSkills();
  },
  methods: {
    async loadSkills() {
      try {
        // Envoi de la requête GET pour récupérer la liste des skills 
        const response = await axios.get(`${config.apiUrl}/skills`);
        // Stockage des skills dans la propriété skills
        this.skills = response.data;
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des skills :", error);
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
        // Envoi de la requête POST pour ajouter une nouvelle certification
        const response = await axios.post(`${config.apiUrl}/certification`, {
          name: this.name,
          details: this.details,
          date: this.date,
          skills: this.selectedSkills
        });

        // Affichage du succès
        this.success = "Nouvelle certification ajoutée : " + response.data.name;


        // Effacer les messages d'erreur précédents
        this.error = null;
        // Redirection automatique vers la liste des compétences après 3 secondes
        setTimeout(() => {
          this.redirectToCertificationList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la certification : " + error.response.data.error;

        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToCertificationList() {
      // Redirection vers la liste des catégories de compétences
      this.$router.push('/get-certifications');
    },
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