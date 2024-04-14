<template>
  <div>
    <h1>Modifier la compétence</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>

      <label for="rating">Note :</label>
      <button type="button" @click="toggleRating" :class="{ selected: rating == undefined }">Pas de note</button>
      <input v-model="rating" type="number" id="rating" min="0" max="100" :disabled="rating === undefined">
           <br>
      <label>Catégories de compétences :</label>
      <div>
        <button
          v-for="category in skillCategories"
          :key="category._id"
          :class="{ selected: isSelected(category._id) }"
          @click="toggleCategory(category._id)"
          :value="category._id"
          type="button"
        >
          {{ category.name }}
        </button>
      </div>

      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToSkillList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
    </form>


    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToSkillList">Voir la liste des certification</button>
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
      name: "", // Nom de la compétence
      // logo: "", // URL du logo de la compétence
      orginalRating: undefined,
      rating: undefined, // Note de la compétence
      ratingsave: 0,
      originalSelectedCategories: [], // Skills de compétences sélectionnées d'origine
      selectedCategories: [], // Catégories de compétences sélectionnées
      skillCategories: [], // Liste des catégories de compétences
      error: null, // Message d'erreur
      success: null // Message de succès
    };
  },
  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkillCategories();
    // Récupération de l'ID de la compétence depuis l'URL
    this.skillId = this.$route.params.id;

    // Charger les détails de la compétence depuis l'API
    this.loadSkillDetails();
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
    async loadSkillDetails() {
      try {
        // Envoi de la requête GET pour récupérer les détails de la compétence
        const response = await axios.get(`${config.apiUrl}/skill/${this.skillId}`);
        // Mettre à jour les valeurs des champs avec les détails de la compétence récupérée
        this.orginalRating = response.data.rating
        this.originalName = response.data.name
        this.ratingsave = response.data.rating;
        this.name = response.data.name;
        this.rating = response.data.rating;
        if (response.data.skillCategory !== null) {
          this.selectedCategories = response.data.skillCategory;
          this.originalSelectedCategories = response.data.skillCategory.slice(); // Créer une copie distincte
        }
      
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des détails de la compétence :", error);
      }
    },
    async submitForm() {
      try {
 
        // Envoi de la requête PATCH pour modifier la compétence
        await axios.patch(`${config.apiUrl}/skill/${this.skillId}`, {
          name: this.name,
          // logo: this.logo,
          rating: this.rating,
          skillCategory: this.selectedCategories // Utiliser les catégories sélectionnées
        });
        // Afficher le message de succès et le bouton de retour à la liste
        this.success = "Compétence modifiée avec succès";
             // Effacer les messages d'erreur précédents
             this.error = null;
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = null;
          // Redirection vers la liste des compétences après 3 secondes
          this.redirectToSkillList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de la modification de la compétence : " + error.response.data.error;
        this.success = null;

      }
    },
    resetForm() {
      // Réinitialiser le champ name avec le nom d'origine
      this.name = this.originalName;
      this.rating = this.orginalRating;
      this.selectedCategories = this.originalSelectedCategories.slice();
    },
    redirectToSkillList() {
      // Redirection vers la liste des compétences
      this.$router.push('/get-skills');
    },

    toggleRating() {
      // Activer ou désactiver le champ de note
      if (this.rating === undefined) {
        if (this.ratingsave === undefined || this.ratingsave === null || this.ratingsave === "null" || this.ratingsave === "") {
          this.ratingsave = 0;
        }
        this.rating = this.ratingsave;
      } else {

        this.ratingsave = this.rating
        this.rating = undefined;
      }
    }
  },


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