<template>
  <div>
    <h1>Modifier la experience</h1>
    <form @submit.prevent="submitForm">
      <label for="company">Nom :</label>
      <input type="text" id="company" v-model="company" required>
      <label for="details">details :</label>
      <input type="text" id="details" v-model="details">
      <label for="job_title">job_title :</label>
      <input type="text" id="job_title" v-model="job_title" required>
      <label for="start_date">start_date</label>
      <input type="date" id="start_date" v-model="start_date" required>
      <label for="end_date">end_date</label>
      <input type="date" id="end_date" v-model="end_date" :disabled="useCurrentDate" required>
      <button type="button" @click="setCurrentDate" :class="{ selected: useCurrentDate }">aujourd'hui</button>
      <br>
      <label>Catégories de compétences :</label>
      <div>
        <button v-for="skill in skills" :key="skill._id" :class="{ selected: isSelected(skill._id) }"
          @click="toggleSkill(skill._id)" :value="skill._id" type="button">
          {{ skill.name }}
        </button>
      </div>
      <button type="submit">Enregistrer</button>
      <button type="button" @click="redirectToExperienceList">Annuler</button>
      <button type="button" @click="resetForm">Réinitialiser</button>
    </form>



    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
    <div v-if="success">
      <button @click="redirectToExperienceList">Voir la liste des experiencehs</button>
    </div>


  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js";

export default {
  data() {
  return {
    originalCompany: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
    company: "", // Champ pour stocker le nom de la catégorie de compétences
    originalDetails: "", // Champ pour stocker le nom d'origine de la catégorie de compétences
    details: "", // Champ pour stocker le nom de la catégorie de compétences
    job_title: "",
    originalSelectedSkills: [], // Skills de compétences sélectionnées d'origine
    selectedSkills: [], // Skills de compétences sélectionnées
    skills: [], // Liste des skills de compétences
    error: null,
    success: null,
    useCurrentDate: false,
    originalEnd_date: "",
    end_date: "",
    originalStart_date: "",
    start_date: "",
    experienceId: null // Ajout de la propriété experienceId pour stocker l'identifiant de l'éducation en cours de modification
  };
},

  async created() {
    // Charger la liste des catégories de compétences lors de la création du composant
    await this.loadSkills();
    // Récupération de l'ID de la catégorie depuis l'URL
    this.experienceId = this.$route.params.id;
    // Charger les détails de la catégorie depuis l'API
    this.loadExperience();
    // Mettre à jour la date de fin lors du chargement de la page
    this.updateEndDate();
  },
  methods: {
    updateEndDate() {
      if (this.useCurrentDate) {
        this.end_date = ""; // ou null si vous préférez
      } 
    },
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
    async loadExperience() {
  try {
    // Effectuer une requête GET pour récupérer les détails de la catégorie
    const response = await axios.get(`${config.apiUrl}/experience/${this.experienceId}`);
    this.company = response.data.company;
    this.originalCompany = response.data.company; // Stocker le nom d'origine
    this.details = response.data.details;
    this.originalDetails = response.data.details; // Stocker le nom d'origine     
    this.job_title = response.data.job_title;
    this.originalJob_title = response.data.job_title; // Stocker le nom d'origine     
    if (response.data.skills !== null) {
      this.selectedSkills = response.data.skills;
      this.originalSelectedSkills = response.data.skills.slice(); // Créer une copie distincte
    }
    this.originalEnd_date = response.data.end_date;
    this.originalStart_date = response.data.start_date;
    this.start_date = response.data.start_date;
    this.end_date = response.data.end_date;

    // Vérifier si end_date a la valeur "aujourd'hui" pour sélectionner automatiquement le bouton "aujourd'hui"
    if (this.end_date === "aujourd'hui") {
      this.useCurrentDate = true;
    }
    this.updateEndDate();
  } catch (error) {
    console.error("Erreur lors du chargement des détails de la experience :", error);
  }
},

    async submitForm() {
      try {
        // Assurez-vous que la valeur de end_date est au format "yyyy-MM-dd"
        let end_dateforma = this.end_date
        if (this.useCurrentDate) {
          end_dateforma = "aujourd'hui";
        }
        // Envoi de la requête PATCH pour modifier la catégorie de compétences
        await axios.patch(`${config.apiUrl}/experience/${this.experienceId}`, {
          company: this.company,
          details: this.details,
          job_title: this.job_title,
          skills: this.selectedSkills,
          end_date: end_dateforma, // Utilisez la version formatée de la date
          start_date: this.start_date
        });
                // Affichage du succès
        this.success = this.originalCompany + " modifié" ;

        // Effacer les messages d'erreur précédents
        this.error = null;

        // Masquer le message de succès après 3 secondes
        setTimeout(() => {
          this.showSuccessMessage = false;
          // Redirection vers la page des catégories de compétences après 3 secondes
          this.redirectToExperienceList();
        }, 3000);
      } catch (error) {
        this.error = "Erreur lors de la modification de la catégorie de compétences : " + error.response.data.error;
        this.success = null;

      }
    },
    resetForm() {
  // Réinitialiser le formulaire avec les valeurs d'origine
  this.company = this.originalCompany;
  this.details = this.originalDetails;
  this.job_title = this.originalJob_title;
  this.start_date = this.originalStart_date;
  this.end_date = this.originalEnd_date;
  this.selectedSkills = this.originalSelectedSkills.slice();
  // Vérifier si end_date a la valeur "aujourd'hui" pour sélectionner automatiquement le bouton "aujourd'hui"
  if (this.end_date === "aujourd'hui") {
    this.useCurrentDate = true;
  } else {
    this.useCurrentDate = false;
  }
  // Mettre à jour la date de fin lors de la réinitialisation du formulaire
  this.updateEndDate();
},

    redirectToExperienceList() {
      // Redirection vers la page des catégories de compétences
      this.$router.push('/get-experiences');
    },
    setCurrentDate() {
      // Basculer l'état de sélection du bouton "aujourd'hui"
      this.useCurrentDate = !this.useCurrentDate;
      // Mettre à jour la date de fin lorsque le bouton "aujourd'hui" est sélectionné ou désélectionné
      this.updateEndDate();
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