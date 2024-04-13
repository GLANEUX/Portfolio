<template>
  <div>
    <h1>Modifier la certification</h1>
    <form @submit.prevent="submitForm">
      <label for="name">Nom :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété name -->
      <input type="text" id="name" v-model="name" required>
      <label for="details">details :</label>
      <!-- Utilisez v-model pour lier le champ à la propriété name -->
      <input type="text" id="details" v-model="details">
      <label for="date">date</label>
      <input type="date" id="date" v-model="date" required>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button v-for="skill in skills" :key="skill._id" :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)" :value="skill._id" type="button">
          {{ skill.name }}
        </button>
      </div>
      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToCertificationList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
    </form>

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
      originalDetails: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
      details: "", // Champ pour stocker le nom de la catégorie de compétences       
      originalSelectedSkills: [], // Skills de compétences sélectionnées d'origine
      selectedSkills: [], // Skills de compétences sélectionnées
      skills: [], // Liste des skills de compétences
      error: null,
      success: null,
      originalDate: "",
      date: "",
      certificationId: null
    };
  },
  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkills();
    // Récupération de l'ID de la catégorie depuis l'URL
    this.certificationId = this.$route.params.id;
    // Charger les détails de la catégorie depuis l'API
    this.loadCertification();
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
        console.error("Erreur lors du chargement des skills :", error);
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
    async loadCertification() {
      try {
        // Effectuer une requête GET pour récupérer les détails de la catégorie
        const response = await axios.get(`${config.apiUrl}/certification/${this.certificationId}`);
        // Mettre à jour la valeur de name avec le nom de la catégorie récupérée
        this.name = response.data.name;
        this.originalName = response.data.name; // Stocker le nom d'origine
        this.details = response.data.details;
        this.originalDetails = response.data.details; // Stocker le nom d'origine 
        if (response.data.skills !== null) {
          this.selectedSkills = response.data.skills;
          this.originalSelectedSkills = response.data.skills.slice(); // Créer une copie distincte
          this.originalDate = response.data.date;
          this.date = response.data.date;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails de la certification :", error);
      }
    },
    async submitForm() {
      try {
        // Envoi de la requête PATCH pour modifier la catégorie de compétences
        await axios.patch(`${config.apiUrl}/certification/${this.certificationId}`, {
          name: this.name,
          details: this.details,
          date: this.date,
          skills: this.selectedSkills
        });
        // Affichage du succès
        this.success = this.originalSchool + " modifié";

        // Effacer les messages d'erreur précédents
        this.error = null;
        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.showSuccessMessage = false;
          // Redirection vers la page des catégories de compétences après 3 secondes
          this.redirectToCertificationList();
        }, 3000);
      } catch (error) {
        this.error = "Erreur lors de la modification de la catégorie de compétences : " + error.response.data.error;
        this.success = null;
        }
    },
    resetForm() {
      // Réinitialiser le champ name avec le nom d'origine
      this.name = this.originalName;
      this.details = this.originalDetails;
      this.selectedSkills = this.originalSelectedSkills.slice();
      this.date = this.originalDate
    },
    redirectToCertificationList() {
      // Redirection vers la page des catégories de compétences
      this.$router.push('/get-certifications');
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