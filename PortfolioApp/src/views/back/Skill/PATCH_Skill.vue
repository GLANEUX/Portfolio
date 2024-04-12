<template>
  <div>
    <h1>Modifier la compétence</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>

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
          :value="category._id"
          type="button"
        >
          {{ category.name }}
        </button>
      </div>

      <button type="submit">Modifier</button>
      <button type="button" @click="redirectToSkillList">Annuler</button>
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
      logo: "", // URL du logo de la compétence
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
    // Récupération de l'ID de la compétence depuis l'URL
    this.skillId = this.$route.params.id;
    // Vérifier si des catégories sont sélectionnées
    if (this.selectedCategories.length === 0) {
      // S'il n'y a pas de catégories sélectionnées, définir selectedCategories comme un tableau vide pour éviter les cases à cocher sélectionnées
      this.selectedCategories = [];
    }
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
    async loadSkillDetails() {
      try {
        // Envoi de la requête GET pour récupérer les détails de la compétence
        const response = await axios.get(`${config.apiUrl}/skill/${this.skillId}`);
        // Mettre à jour les valeurs des champs avec les détails de la compétence récupérée
        this.name = response.data.name;
        this.rating = response.data.rating;
        if (response.data.skillCategory !== null) {
          this.selectedCategories = response.data.skillCategory;
        }
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des détails de la compétence :", error);
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
        // Filtrer les catégories non sélectionnées
        const selectedCategories = this.selectedCategories.filter(category => category !== "");
        // Envoi de la requête PATCH pour modifier la compétence
        await axios.patch(`${config.apiUrl}/skill/${this.skillId}`, {
          name: this.name,
          logo: this.logo,
          rating: this.rating,
          skillCategory: selectedCategories // Utiliser les catégories sélectionnées
        });
        // Afficher le message de succès et le bouton de retour à la liste
        this.success = "Compétence modifiée avec succès";
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = null;
          // Redirection vers la liste des compétences après 3 secondes
          this.redirectToSkillList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de la modification de la compétence : " + error.response.data.error;
      }
    },
    redirectToSkillList() {
      // Redirection vers la liste des compétences
      this.$router.push('/get-skills');
    },
    addNewSkill() {
      // Redirection vers le formulaire pour ajouter une nouvelle compétence
      this.$router.push('/add-skill');
    },
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
</style>