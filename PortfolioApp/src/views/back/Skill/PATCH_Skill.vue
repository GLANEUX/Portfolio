<template>
  <div>
    <h1>Modifier la compétence</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>

      <div v-if="file">
        <img :src="isFromServer(file) ? `${URLapi}${file}` : preview" alt="Image de la compétence"
          style="max-width: 200px; max-height: 200px;">
        <button @click="deleteFile">Supprimer</button>
      </div>


      <!-- Champ d'ajout de fichier -->
      <div v-if="!file">
        <label for="file">Ajouter un fichier :</label>
        <input type="file" id="file" ref="file" @change="handleFileChange">
      </div>





      <label for="rating">Note :</label>
      <button type="button" @click="toggleRating" :class="{ selected: rating == undefined }">Pas de note</button>
      <input v-model="rating" type="number" id="rating" min="0" max="100" :disabled="rating === undefined">
      <br>

      <label>Catégories de compétences :</label>

      <div>
        <!-- Boucle sur les skills uniquement s'il y en a -->
        <button v-if="skillCategories.length > 0" v-for="category in skillCategories" :key="category._id"
          :class="{ selected: isSelected(category._id) }" @click="toggleCategory(category._id)" :value="category._id"
          type="button">
          {{ category.name }}
        </button>
        <!-- Affiche "Ajouter un skill" s'il n'y a aucun skill -->
        <span v-else> <router-link to="/add-skill-category">Ajouter un category</router-link>
        </span>
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
      orginalRating: undefined,
      rating: undefined, // Note de la compétence
      ratingsave: 0,
      originalFile: undefined, // URL du logo de la compétence
      file: undefined, // URL du logo de la compétence
      originalSelectedCategories: [], // Skills de compétences sélectionnées d'origine
      selectedCategories: [], // Catégories de compétences sélectionnées
      skillCategories: [], // Liste des catégories de compétences
      error: null, // Message d'erreur
      success: null, // Message de succès
      ImageToDelete: undefined, // Image à supprimer
      URLapi: config.apiUrl,
      preview: ""
    };
  },
  async created() {
    await this.loadSkillCategories();
    this.skillId = this.$route.params.id;
    this.loadSkillDetails();
  },
  methods: {
    deleteFile() {
      if (this.isFromServer(this.file)) {
        this.addImageToDelete(this.file);
      }
      if (this.$refs.file) {
        this.$refs.file.value = "";
      }
      this.file = undefined;
    },
    addImageToDelete(image) {
      this.ImageToDelete = image;
    },
    isFromServer(file) {
      if(this.preview){
        return false
      }else{
        return file && file.startsWith("/uploads");
      }
    },
    handleFileChange(event) {
      const selectedFile = event.target.files[0];
      this.file = event.target.files[0];
      if (selectedFile) {
        this.preview = URL.createObjectURL(selectedFile);
        this.$refs.file.value = "";
      }
    },

    async loadSkillCategories() {
      try {
        const response = await axios.get(`${config.apiUrl}/skillCategorys`);
        this.skillCategories = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des catégories de compétences :", error);
      }
    },
    toggleCategory(categoryId) {
      if (this.isSelected(categoryId)) {
        this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
      } else {
        this.selectedCategories.push(categoryId);
      }
    },
    isSelected(categoryId) {
      return this.selectedCategories.includes(categoryId);
    },
    async loadSkillDetails() {
      try {
        const response = await axios.get(`${config.apiUrl}/skill/${this.skillId}`);
        this.orginalRating = response.data.rating
        this.originalName = response.data.name
        this.ratingsave = response.data.rating;
        this.name = response.data.name;
        this.rating = response.data.rating;
        if (response.data.skillCategory !== null) {
          this.selectedCategories = response.data.skillCategory;
          this.originalSelectedCategories = response.data.skillCategory.slice();
        }
        this.file = response.data.file
        this.originalFile = response.data.file
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la compétence :", error);
      }
    },
    async submitForm() {
      try {
        console.log(this.file, "-----------------------------------------here")
        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('name', this.name);
        formData.append('rating', this.rating);
        formData.append('skillCategory', this.selectedCategories);
        formData.append('ImageToDelete', this.ImageToDelete);

        await axios.patch(`${config.apiUrl}/skill/${this.skillId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.success = "Compétence modifiée avec succès";
        this.error = null;
        setTimeout(() => {
          this.success = null;
          this.redirectToSkillList();
        }, 3000);
      } catch (error) {
        this.error = "Erreur lors de la modification de la compétence : " + error.response.data.error;
        this.success = null;
      }
    },
    resetForm() {
      this.name = this.originalName;
      this.rating = this.orginalRating;
      this.selectedCategories = this.originalSelectedCategories.slice();
      this.file = this.originalFile;
      this.ImageToDelete = undefined
    },
    redirectToSkillList() {
      this.$router.push('/get-skills');
    },
    toggleRating() {
      if (this.rating === undefined) {
        if (this.ratingsave === undefined || this.ratingsave === null || this.ratingsave === "null" || this.ratingsave === "") {
          this.ratingsave = 0;
        }
        this.rating = this.ratingsave;
      } else {
        this.ratingsave = this.rating;
        this.rating = undefined;
      }
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
