<template>
  <div>
    <h1>Modifier la project</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <input type="text" id="name" v-model="name" required>
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details" >
      <label for="shortDescription">shortDescription :</label>
      <input type="text" id="shortDescription" v-model="shortDescription" >
      <br>
      <label>Catégories de compétences :</label>

      <div>
        <!-- Boucle sur les skills uniquement s'il y en a -->
        <button v-if="skills.length > 0" v-for="skill in skills" :key="skill._id"
          :class="{ selected: isSelected(skill._id) }" @click="toggleSkill(skill._id)" :value="skill._id" type="button">
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

      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToProjectList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
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
import config from "@/config.js";

export default {
  data() {
    return {
      originalName: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
      name: "", // Champ pour stocker le nom de la catégorie de compétences
      originalDetails: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
      details: "", // Champ pour stocker le nom de la catégorie de compétences
      shortDescription: "",
      originalSelectedSkills: [], // Skills de compétences sélectionnées d'origine
      selectedSkills: [], // Skills de compétences sélectionnées
      originalLinks: [],
      links: [],
      skills: [], // Liste des skills de compétences      
      error: null,
      success: null,
      projectId: null // Ajout de la propriété educationId pour stocker l'identifiant de l'éducation en cours de modification

    };
  },
  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkills();
    // Récupération de l'ID de la catégorie depuis l'URL
    this.projectId = this.$route.params.id;

    // Charger les détails de la catégorie depuis l'API
    this.loadProject();
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
    async loadProject() {
      try {
        // Effectuer une requête GET pour récupérer les détails de la catégorie
        const response = await axios.get(`${config.apiUrl}/project/${this.projectId}`);
        // Mettre à jour la valeur de name avec le nom de la catégorie récupérée
        this.name = response.data.name;
        this.originalName = response.data.name; // Stocker le nom d'origine
        this.details = response.data.details;
        this.originalDetails = response.data.details; // Stocker le nom d'origine     
        this.shortDescription = response.data.shortDescription;
        this.originalShortDescription = response.data.shortDescription; // Stocker le nom d'origine     
        if (response.data.skills !== null) {
          this.selectedSkills = response.data.skills;
          this.originalSelectedSkills = response.data.skills.slice(); // Créer une copie distincte
        }
        if (response.data.links !== null) {
          this.links = response.data.links;
          this.originalLinks = response.data.links.slice(); // Créer une copie distincte
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la project :", error);
      }
    },
    async submitForm() {
      try {
        // Envoi de la requête PATCH pour modifier la catégorie de compétences
        await axios.patch(`${config.apiUrl}/project/${this.projectId}`, {
          name: this.name,
          details: this.details,
          shortDescription: this.shortDescription,
          skills: this.selectedSkills,
          links: this.links
        });
        // Affichage du succès
        this.success = this.originalName + " modifié";

        // Effacer les messages d'erreur précédents
        this.error = null;
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.success = null;
          // Redirection vers la page des catégories de compétences après 3 secondes
          this.redirectToProjectList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        console.error("Erreur lors de la modification de la catégorie de compétences :", error);
        this.success = null;
      }
    },
    resetForm() {
      // Réinitialiser le champ name avec le nom d'origine
      this.name = this.originalName;
      this.details = this.originalDetails;
      this.shortDescription = this.originalShortDescription;
      this.selectedSkills = this.originalSelectedSkills.slice();
      this.links = this.originalLinks.slice()

    },
    redirectToProjectList() {
      // Redirection vers la page des catégories de compétences
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