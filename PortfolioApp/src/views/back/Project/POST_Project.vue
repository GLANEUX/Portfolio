<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="name">Name :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="shortDescription">shortDescription :</label>
      <input type="text" id="shortDescription" v-model="shortDescription">
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details">
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




      <br />
      <label for="links">Liens :</label>
      <div v-for="(link, index) in links" :key="index">
        <input type="text" v-model="link.name" placeholder="Nom du lien" required>
        <input type="url" v-model="link.url" placeholder="URL du lien" required>
        <button type="button" @click="removeLink(index)">Supprimer le lien</button>
      </div>
      <button type="button" @click="addLink">Ajouter un lien</button>

      <br />
      <label for="images">Images :</label>
      <div v-for="(image, index) in images" :key="index">
        <input type="text" v-model="image.title" placeholder="Titre" required>
        <input type="text" v-model="image.alt" placeholder="alt" required>
        <input type="text" v-model="image.description" placeholder="Description" required>
        <input type="file" v-if="!image.file" @change="handleFileChange($event, index)" required>
        <img v-if="image.preview" :src="image.preview" alt="Preview" style="max-width: 200px; max-height: 200px;">

        <button v-if="image.file" type="button" @click="deleteFile(index)">Supprimer fichier</button>
        <button type="button" @click="removeImage(index)">Supprimer image</button>
      </div>
      <br />
      <button type="button" @click="addImage">Ajouter une image</button>



      <br />
      <button type="submit">Ajouter</button>
    </form>


    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToProjectList">Voir la liste des educationhs</button>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      name: "", // Champ pour stocker le nom de la skill de compétences
      details: "", // Champ pour stocker le nom de la skill de compétences
      shortDescription: "",
      selectedSkills: [], // Skills de compétences sélectionnées
      skills: [], // Liste des skills de compétences
      links: [],
      images: [],
      preview: "",
      file: undefined, // URL du logo de la compétence
      error: null, // Propriété pour stocker les erreurs
      success: null // Propriété pour stocker les succès
    };
  },
  async created() {
    // Charger la liste des skills de compétences lors de la création du composant
    await this.loadSkills();
  },

  methods: {
    handleFileChange(event, index) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        this.images[index].file = selectedFile;
        this.images[index].preview = URL.createObjectURL(selectedFile);
      }
    },
    deleteFile(index) {
      this.images[index].file = undefined;
      this.images[index].preview = '';
    },

    async loadSkills() {
      try {
        // Envoi de la requête GET pour récupérer la liste des skills de compétences
        const response = await axios.get(`${config.apiUrl}/skills`);
        // Stockage des skills de compétences dans la propriété skills
        this.skills = response.data;
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors du chargement des skills de compétences :", error);
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

   // Créer un objet FormData pour envoyer le fichier avec la requête POST
   const formData = new FormData();
      formData.append('name', this.name);
      formData.append('details', this.details);
      formData.append('shortDescription', this.shortDescription);
      formData.append('skills', this.selectedSkills);
  // Ajouter les liens à FormData
  this.links.forEach((link, index) => {
      formData.append(`links[${index}][name]`, link.name);
      formData.append(`links[${index}][url]`, link.url);
    });// Ajouter les fichiers d'image à FormData
this.images.forEach((image, index) => {
      formData.append(`images[${index}][title]`, image.title);
      formData.append(`images[${index}][alt]`, image.alt);
      formData.append(`images[${index}][description]`, image.description);
      formData.append(`images[${index}][url]`, "");
      if (image.file) {
        formData.append(`images[${index}][file]`, image.file);
      }
    });      // Envoi de la requête POST avec les données FormData
      const response = await axios.post(`${config.apiUrl}/project`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });


        // Affichage du succès
        this.success = "Nouvelle project ajoutée : " + response.data.name;

        // Effacer les messages d'erreur précédents
        this.error = null;
        //  Redirection automatique vers la liste des compétences après 3 secondes
        setTimeout(() => {
          this.redirectToProjectList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la project : " + error.response.data.error;

        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToProjectList() {
      // Redirection vers la liste des skills de compétences
      this.$router.push('/get-projects');
    },
    addLink() {
      this.links.push({ name: '', url: '' });
    },


    removeLink(index) {
      this.links.splice(index, 1);
    },
    addImage() {
      this.images.push({ title: "", alt: "", description: "", file: undefined, preview: "" });
    },

    removeImage(index) {
      this.images.splice(index, 1);
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