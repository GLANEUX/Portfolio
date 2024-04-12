<template>
  <div>
    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="logo">Logo :</label>
      <input type="file" id="logo" ref="logo">
      <label for="rating">Note :</label>
      <input type="number" id="rating" v-model="rating" min="0" max="100">
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button
          v-for="category in skillCategories"
          :key="category._id"
          :class="{ selected: isSelected(category._id) }"
          @click="toggleCategory(category._id)"
          type="button"
        >
          {{ category.name }}
        </button>
      </div>
      <button type="submit">Ajouter</button>
    </form>

    <!-- Affichage des erreurs -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Affichage du succès -->
    <div v-if="success" class="success">
      {{ success }}
      <!-- Boutons pour voir la liste des compétences ou ajouter une nouvelle compétence -->
      <button @click="redirectToSkillList">Voir la liste des compétences</button>
      <button @click="addNewSkill">Ajouter une nouvelle compétence</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js";

export default {
  data() {
    return {
      name: "", // Nom de la compétence
      logo: undefined, // URL du logo de la compétence
      rating: undefined, // Note de la compétence
      selectedCategories: [], // Catégories de compétences sélectionnées
      skillCategories: [], // Liste des catégories de compétences
      error: null, // Message d'erreur
      success: null // Message de succès
    };
  },
  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkillCategories();
  },
  methods: {
    async loadSkillCategories() {
      try {
        // Envoi de la requête GET pour récupérer la liste des catégories de compétences
        const response = await axios.get(`${config.apiUrl}/skillCategorys`);
        // Stockage des catégories de compétences dans la propriété skillCategories
        this.skillCategories = response.data;
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des catégories de compétences :", error);
      }
    },
    toggleCategory(categoryId) {
      // Vérifier si la catégorie est déjà sélectionnée
      if (this.isSelected(categoryId)) {
        // Si la catégorie est déjà sélectionnée, la supprimer de la liste des catégories sélectionnées
        this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
      } else {
        // Sinon, ajouter la catégorie à la liste des catégories sélectionnées
        this.selectedCategories.push(categoryId);
      }
    },
    isSelected(categoryId) {
      // Vérifier si la catégorie est déjà sélectionnée
      return this.selectedCategories.includes(categoryId);
    },
    async submitForm() {
        try {
          console.log(this.selectedCategories)
          // Envoi de la requête POST pour ajouter une nouvelle compétence
          const response = await axios.post(`${config.apiUrl}/skill`, {
            name: this.name,
            logo: this.logo,
            rating: this.rating,
            skillCategory: this.selectedCategories // Utiliser les catégories sélectionnées
          });

        // Affichage du succès
        this.success = "Nouvelle compétence ajoutée : " + responseskill.data.name;

        // Réinitialisation des champs après l'ajout
        this.name = "";
        this.logo = undefined;
        this.rating = undefined;
        this.selectedCategories = [];

        // Effacer les messages d'erreur précédents
        this.error = null;

        // Redirection automatique vers la liste des compétences après 3 secondes
        setTimeout(() => {
          this.redirectToSkillList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la compétence : " + error.response.data.error;

        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToSkillList() {
      // Redirection vers la liste des compétences
      this.$router.push('/get-skills');
    },
    addNewSkill() {
      // Réinitialiser le formulaire pour ajouter une nouvelle compétence
      this.success = null; // Effacer le message de succès
      this.error = null; // Effacer les erreurs
      this.name = ""; // Réinitialiser le champ de nom
      this.logo = undefined; // Réinitialiser le champ de logo
      this.rating = undefined; // Réinitialiser le champ de note
      this.selectedCategories = []; // Réinitialiser les catégories sélectionnées
    }
  },
  clearRating() {
    // Efface la valeur du champ rating
    this.rating = undefined;
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