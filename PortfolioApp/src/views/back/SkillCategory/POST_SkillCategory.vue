<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>
      <button type="submit">Ajouter</button>
    </form>
    
    <!-- Affichage des erreurs -->
    <div v-if="error" class="error">{{ error }}</div>
    
    <!-- Affichage du succès -->
    <div v-if="success" class="success">{{ success }}</div>

    <!-- Boutons après succès -->
    <div v-if="success">
      <button @click="redirectToCategoryList">Voir la liste des catégories</button>
      <button @click="addNewCategory">Ajouter une nouvelle catégorie</button>
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
      error: null, // Propriété pour stocker les erreurs
      success: null // Propriété pour stocker les succès
    };
  },
  methods: {
    async submitForm() {
      try {
        // Envoi de la requête POST pour ajouter une nouvelle catégorie de compétences
        const response = await axios.post(`${config.apiUrl}/skillCategory`, {
          name: this.name
        });
        
        // Affichage du succès
        this.success = "Nouvelle catégorie de compétences ajoutée : " + response.data.name;
        
        // Réinitialisation du champ "name" après l'ajout
        this.name = "";
        
        // Effacer les messages d'erreur précédents
        this.error = null;
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la catégorie de compétences : " + error.response.data.error;
        
        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToCategoryList() {
      // Redirection vers la liste des catégories de compétences
      this.$router.push('/get-skill-categorys');
    },
    addNewCategory() {
      // Réinitialiser le formulaire pour ajouter une nouvelle catégorie
      this.success = null; // Effacer le message de succès
      this.error = null; // Effacer les erreurs
      this.name = ""; // Réinitialiser le champ de nom
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
</style>
