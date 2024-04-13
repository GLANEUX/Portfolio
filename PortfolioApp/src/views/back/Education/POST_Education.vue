<template>
  <div>


    <form @submit.prevent="submitForm">
      <label for="school">School :</label>
      <input type="text" id="school" v-model="school" required>
      <label for="program">program :</label>
      <input type="text" id="program" v-model="program">
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details">
      <label for="start_date">start_date</label>
      <input type="date" id="start_date" v-model="start_date" required>
      <label for="end_date">end_date</label>
      <input type="date" id="end_date" v-model="end_date" :disabled="useCurrentDate" required>
      <button type="button" @click="setCurrentDate" :class="{ selected: useCurrentDate }">aujourd'hui</button>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button v-for="skill in skills" :key="skill._id" :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)" type="button">
          {{ skill.name }}
        </button>
      </div>
      <button type="submit">Ajouter</button>
    </form>


    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToEducationList">Voir la liste des educationhs</button>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js";

export default {
  data() {
    return {
      school: "",
      details: "",
      program: "",
      selectedSkills: [],
      skills: [],
      error: null,
      success: null,
      useCurrentDate: false,
      start_date: "",
      end_date: ""

    };
  },
  async created() {
    // Charger la liste des skills lors de la création du composant
    await this.loadSkills();
  },

  methods: {
    async loadSkills() {
      try {
        // Envoi de la requête GET pour récupérer la liste des skills 
        const response = await axios.get(`${config.apiUrl}/skills`);
        // Stockage des skills dans la propriété skills
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
    async submitForm() {
      try {
        let end_dateforma = this.end_date
        if (this.useCurrentDate) {
          end_dateforma = "aujourd'hui";
        }
        // Envoi de la requête POST pour ajouter une nouvelle education
        const response = await axios.post(`${config.apiUrl}/education`, {
          school: this.school,
          details: this.details,
          program: this.program,
          skills: this.selectedSkills,
          end_date: end_dateforma,
          start_date: this.start_date
        });
        // Affichage du succès
        this.success = "Nouvelle education ajoutée : " + response.data.school;

        // Effacer les messages d'erreur précédents
        this.error = null;
        // Redirection automatique vers la liste des compétences après 3 secondes
        setTimeout(() => {
          this.redirectToEducationList();
        }, 3000);
      } catch (error) {
        // Gestion des erreurs
        this.error = "Erreur lors de l'ajout de la education : " + error.response.data.error;

        // Effacer les messages de succès précédents
        this.success = null;
      }
    },
    redirectToEducationList() {
      // Redirection vers la liste des skills de compétences
      this.$router.push('/get-educations');
    },
    setCurrentDate() {
      // Basculer l'état de sélection du bouton "aujourd'hui"
      this.useCurrentDate = !this.useCurrentDate;
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