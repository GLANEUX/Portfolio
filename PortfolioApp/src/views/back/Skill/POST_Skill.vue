<template>
  <div>
    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>
      <div v-if="file">
        <img :src="preview" alt="Image de la compétence"
          style="max-width: 200px; max-height: 200px;">
        <button @click="deleteFile">Supprimer</button>
      </div>


      <!-- Champ d'ajout de fichier -->
      <div v-if="!file">
        <label for="file">Ajouter un fichier :</label>
        <input type="file" id="file" ref="file" @change="handleFileChange">
      </div>

      <label>Note :</label>
      <button type="button" @click="toggleRating" :class="{ selected: rating == undefined }">Pas de note</button>
      <input v-model="rating" type="number" id="rating" min="0" max="100" :disabled="rating === undefined">
      <br>
      <label>Catégories de compétences :</label>

      <div>
        <!-- Boucle sur les skills uniquement s'il y en a -->
        <button v-if="skillCategories.length > 0" v-for="category in skillCategories" :key="category._id"
          :class="{ selected: isSelected(category._id) }" @click="toggleCategory(category._id)"  type="button">
          {{ category.name }}
        </button>
        <!-- Affiche "Ajouter un skill" s'il n'y a aucun skill -->
        <span v-else> <router-link to="/add-skill-category">Ajouter un category</router-link>
        </span>
      </div>
      <button type="submit">Ajouter</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToSkillList">Voir la liste des skill</button>
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
      file: undefined, // URL du logo de la compétence
      rating: 0, // Note de la compétence
      selectedCategories: [], // Catégories de compétences sélectionnées
      skillCategories: [], // Liste des catégories de compétences
      error: null, // Message d'erreur
      success: null, // Message de succès
      preview: ""
    };
  },
  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkillCategories();
  },
  methods: {
    handleFileChange(event) {
      const selectedFile = event.target.files[0];
      this.file = event.target.files[0];
      if (selectedFile) {
        this.preview = URL.createObjectURL(selectedFile);
        this.$refs.file.value = "";
      }
    },
    deleteFile() {
      if (this.$refs.file) {
        this.$refs.file.value = "";
      }
      this.file = undefined;
    },
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
     // Créer un objet FormData pour envoyer le fichier avec la requête POST
     const formData = new FormData();
      formData.append('file', this.file);
      formData.append('name', this.name);
      formData.append('rating', this.rating);
      formData.append('skillCategory', this.selectedCategories);
      // Envoi de la requête POST avec les données FormData
      const response = await axios.post(`${config.apiUrl}/skill`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

        // Affichage du succès
        this.success = "Nouvelle compétence ajoutée : " + response.data.name;


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