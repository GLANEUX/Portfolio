<template>
    <div>
      <form @submit.prevent="submitForm">
        <label for="name">Nom :</label>
        <input type="text" id="name" v-model="name" required>
        <label for="details">Details :</label>
        <input type="text" id="details" v-model="details" required>
                <button type="submit">Ajouter</button>
      </form>
      
      <!-- Affichage des erreurs -->
      <div v-if="error" class="error">{{ error }}</div>
      
      <!-- Affichage du succès -->
      <div v-if="success" class="success">{{ success }}</div>
  
      <!-- Boutons après succès -->
      <div v-if="success">
        <button @click="redirectToCertificationList">Voir la liste des catégories</button>
        <button @click="addNewCertification">Ajouter une nouvelle catégorie</button>
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
        success: null // Propriété pour stocker les succès
      };
    },
    methods: {
      async submitForm() {
        try {
          // Envoi de la requête POST pour ajouter une nouvelle certification
          const response = await axios.post(`${config.apiUrl}/certification`, {
            name: this.name,
            details: this.details
          });
          
          // Affichage du succès
          this.success = "Nouvelle certification ajoutée : " + response.data.name;
          
          // Réinitialisation du champ "name" après l'ajout
          this.name = "";
          this.details = "";
          // Effacer les messages d'erreur précédents
          this.error = null;
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
      addNewCertification() {
        // Réinitialiser le formulaire pour ajouter une nouvelle catégorie
        this.success = null; // Effacer le message de succès
        this.error = null; // Effacer les erreurs
        this.name = ""; // Réinitialiser le champ de nom
        this.details = ""; // Réinitialiser le champ de nom
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
  