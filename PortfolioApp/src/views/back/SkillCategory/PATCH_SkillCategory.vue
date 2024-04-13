<template>
  <div>
    <h1>Modifier la catégorie de compétences</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété name -->
      <input type="text" id="name" v-model="name" required>
      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToCategoryList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
    </form>
    <!-- Affichage du message et du bouton de retour à la liste -->
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToCertificationList">Voir la liste des certification</button>
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
      categoryId: "", // Champ pour stocker l'ID de la catégorie de compétences
      error: null,
      success: null,
    };
  },
  created() {
    // Récupération de l'ID de la catégorie depuis l'URL
    this.categoryId = this.$route.params.id;
    // Charger les détails de la catégorie depuis l'API
    this.loadCategoryDetails();
  },
  methods: {
    async loadCategoryDetails() {
      try {
        // Effectuer une requête GET pour récupérer les détails de la catégorie
        const response = await axios.get(`${config.apiUrl}/skillCategory/${this.categoryId}`);
        // Mettre à jour la valeur de name avec le nom de la catégorie récupérée
        this.name = response.data.name;
        this.originalName = response.data.name; // Stocker le nom d'origine
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la catégorie de compétences :", error);
      }
    },
    async submitForm() {
      try {
        // Envoi de la requête PATCH pour modifier la catégorie de compétences
        await axios.patch(`${config.apiUrl}/skillCategory/${this.categoryId}`, {
          name: this.name
        });
        // Affichage du succès
        this.success = this.name + " modifié";

        // Effacer les messages d'erreur précédents
        this.error = null;
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = null; 
          // Redirection vers la page des catégories de compétences après 3 secondes
          this.redirectToCertificationList();
        }, 3000);
      } catch (error) {
        this.error = "Erreur lors de la modification de la catégorie de compétences : " + error.response.data.error;
        this.success = null; }
    },
    resetForm() {
      // Réinitialiser le champ name avec le nom d'origine
      this.name = this.originalName;
    },
    redirectToCategoryList() {
      // Redirection vers la page des catégories de compétences
      this.$router.push('/get-skill-categorys');
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