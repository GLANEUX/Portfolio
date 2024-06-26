<template>
  <div>
    <h1>Liste des éducations</h1>

    <div v-if="experiences.length === 0">
      <p>Aucune éducation pour le moment.</p>
      <!-- Lien vers la création d'une nouvelle éducation -->
      <router-link to="/add-experience">Créer une nouvelle éducation</router-link>
    </div>

    <div v-else>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Company</th>
          <th>Détails</th>
          <th>job_title</th>
          <th>Compétences</th>
          <th>Date de début</th>
          <th>Date de fin</th>
          <th>Date de création</th>
          <th>Date de mise à jour</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="experience in experiences" :key="experience._id">
          <td>{{ experience._id }}</td>
          <td>{{ experience.company }}</td>
          <td>{{ experience.details }}</td>
          <td>{{ experience.job_title }}</td>
          <td>
            <div v-if="experience.skills">
              <span v-for="(skillName, index) in experience.skillNames" :key="index">
                <span v-if="index !== 0">, </span>
                <span>{{ skillName }}</span>
              </span>
            </div>
          </td>
          <!-- Affichage de la date de début dans le format "jour mois année" -->
          <td>{{ formatDate(experience.start_date) }}</td>
          <!-- Affichage de la date de fin dans le format "jour mois année" -->
          <td>{{ formatDate(experience.end_date) }}</td>
          <td>{{ experience.created_at }}</td>
          <td>{{ experience.updated_at }}</td>
          <td>
            <button @click="confirmDelete(experience)">Supprimer</button>
            <button @click="redirectToEdit(experience._id)">Modifier</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Confirmation de suppression -->
    <div v-if="deleteConfirmation" class="delete-confirmation">
      <p>Voulez-vous vraiment supprimer {{ deleteConfirmation.company }} ?</p>
      <button @click="cancelDelete">Annuler</button>
      <button @click="deleteConfirmed">Confirmer</button>
    </div>

    <!-- Message de succès après la suppression -->
    <div v-if="deleteSuccessMessage" class="delete-success">
      {{ deleteSuccessMessage }} supprimé avec succès.
    </div>
  </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      experiences: [], // Tableau pour stocker les catégories de compétences récupérées
      deleteConfirmation: null, // Stocke temporairement les informations de confirmation de suppression
      deleteSuccessMessage: "" // Message de succès après la suppression
    };
  },
  mounted() {
    this.getExperiences(); // Appel de la méthode pour récupérer les catégories de compétences lors du montage du composant
  },
  methods: {
    async getExperiences() {
      try {
        const response = await axios.get(`${config.apiUrl}/experiences`);
        this.experiences = response.data;
        await this.getSkillNames();
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
      }
    },
    async getSkillNames() {
      try {
        // Parcours des compétences
        for (const experience of this.experiences) {
          // Vérification si skillCategory n'est pas null
          if (experience.skills) {
            // Initialisation des noms des catégories pour cette compétence
            experience.skillNames = [];
            // Parcours des IDs de catégorie dans skillCategory
            for (const skillId of experience.skills) {
              // Requête HTTP pour obtenir le nom de la catégorie
              const response = await axios.get(`${config.apiUrl}/skill/${skillId}`);
              // Ajout du nom de la catégorie à la liste des noms pour cette compétence
              experience.skillNames.push(response.data.name);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des noms de catégorie de compétences :", error);
      }
    },
    confirmDelete(experience) {
      this.deleteConfirmation = experience;
    },
    cancelDelete() {
      this.deleteConfirmation = null;
    },
    async deleteConfirmed() {
      try {
        await axios.delete(`${config.apiUrl}/experience/${this.deleteConfirmation._id}`);
        this.deleteSuccessMessage = this.deleteConfirmation.company;
        await this.getExperiences(); // Actualiser la liste des catégories après la suppression
        setTimeout(() => {
          this.deleteSuccessMessage = ""; // Effacer le message de succès après quelques secondes
        }, 3000);
        this.deleteConfirmation = null; // Réinitialiser la confirmation de suppression
      } catch (error) {
        console.error("Erreur lors de la suppression de la experience :", error);
      }
    },
    redirectToEdit(experienceId) {
      this.$router.push(`/edit-experience/${experienceId}`);
    },
    formatDate(dateString) {

      if (dateString == "aujourd'hui") {
        return dateString;
      }

      if (dateString != "aujourd'hui") {
        // Création d'une instance de Date à partir de la chaîne de date
        const date = new Date(dateString);
        // Options de formatage pour la date
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        // Utilisation de la méthode toLocaleDateString pour formater la date
        return date.toLocaleDateString('fr-FR', options);
      }
    }

  }
};
</script>

<style>
/* Styles CSS facultatifs pour le tableau */
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.delete-confirmation {
  border: 1px solid #ccc;
  padding: 10px;
  margin-top: 10px;
}

.delete-confirmation button {
  margin-right: 10px;
}
</style>
