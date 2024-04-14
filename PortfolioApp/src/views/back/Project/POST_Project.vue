<template>
  <div>
    <form @submit.prevent="submitForm">
      <label for="name">Name :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="shortDescription">shortDescription :</label>
      <input type="text" id="shortDescription" v-model="shortDescription" >
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details" >
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
      <br/>
      <label for="links">Liens :</label>
<div v-for="(link, index) in links" :key="index">
    <input type="text" v-model="link.name" placeholder="Nom du lien" required>
    <input type="url" v-model="link.url" placeholder="URL du lien" required>
    <button type="button" @click="removeLink(index)">Supprimer le lien</button>
</div>
<button type="button" @click="addLink">Ajouter un lien</button>
<br/>
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
      error: null, // Propriété pour stocker les erreurs
      success: null // Propriété pour stocker les succès
    };
  },
  async created() {
    // Charger la liste des skills de compétences lors de la création du composant
    await this.loadSkills();
  },

  methods: {
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
        // Envoi de la requête POST pour ajouter une nouvelle project
        const response = await axios.post(`${config.apiUrl}/project`, {
          name: this.name,
          details: this.details,
          shortDescription: this.shortDescription,
          skills: this.selectedSkills,
          links: this.links
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