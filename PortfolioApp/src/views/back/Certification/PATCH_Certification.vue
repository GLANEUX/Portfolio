<template>
    <div>
      <h1>Modifier la certification</h1>
      <form @submit.prevent="submitForm">
        <label for="name">Nom :</label>
        <!-- Utilisez v-model pour lier le champ à la propriété name -->
        <input type="text" id="name" v-model="name" required>
        <label for="details">details :</label>
        <!-- Utilisez v-model pour lier le champ à la propriété name -->
        <input type="text" id="details" v-model="details" required>
        <button type="submit">Enregistrer</button>
        <button type="button" @click="redirectToCertificationList">Annuler</button>
        <button type="button" @click="resetForm">Réinitialiser</button>
      </form>
      <!-- Affichage du message et du bouton de retour à la liste -->
      <div v-if="showSuccessMessage">
        <p>{{ successMessage }}</p>
        <button @click="redirectToCertificationList">Retour à la liste</button>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import config from "@/config.js";
  
  export default {
    data() {
      return {
        originalName: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
        name: "", // Champ pour stocker le nom de la catégorie de compétences
        originalDetails: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
        details: "", // Champ pour stocker le nom de la catégorie de compétences       
        categoryId: "", // Champ pour stocker l'ID de la catégorie de compétences
        showSuccessMessage: false, // Boolean pour contrôler l'affichage du message de succès
        successMessage: "" // Message de succès à afficher
      };
    },
    created() {
      // Récupération de l'ID de la catégorie depuis l'URL
      this.certificationId = this.$route.params.id;
      // Charger les détails de la catégorie depuis l'API
      this.loadCertification();
    },
    methods: {
      async loadCertification() {
        try {
          // Effectuer une requête GET pour récupérer les détails de la catégorie
          const response = await axios.get(`${config.apiUrl}/certification/${this.certificationId}`);
          // Mettre à jour la valeur de name avec le nom de la catégorie récupérée
          this.name = response.data.name;
          this.originalName = response.data.name; // Stocker le nom d'origine
          this.details = response.data.details;
          this.originalDetails = response.data.details; // Stocker le nom d'origine     
        } catch (error) {
          console.error("Erreur lors du chargement des détails de la certification :", error);
        }
      },
      async submitForm() {
        try {
          // Envoi de la requête PATCH pour modifier la catégorie de compétences
          await axios.patch(`${config.apiUrl}/certification/${this.certificationId}`, {
            name: this.name,
            details: this.details
          });
          // Afficher le message de succès et le bouton de retour à la liste
          this.showSuccessMessage = true;
          this.successMessage = `"${this.originalName}" modifié`;
          // Masquer le message de succès après 3 secondes
          setTimeout(() => {
            this.showSuccessMessage = false;
            // Redirection vers la page des catégories de compétences après 3 secondes
            this.redirectToCertificationList();
          }, 3000);
        } catch (error) {
          // Gestion des erreurs
          console.error("Erreur lors de la modification de la catégorie de compétences :", error);
        }
      },
      resetForm() {
        // Réinitialiser le champ name avec le nom d'origine
        this.name = this.originalName;
        this.details = this.originalDetails;
      },
      redirectToCertificationList() {
        // Redirection vers la page des catégories de compétences
        this.$router.push('/get-certifications');
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
  