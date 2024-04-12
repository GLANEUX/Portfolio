<template>
  <div>
    <h1>Liste des ceducation</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>School</th>
          <th>Details</th>
          <th>program</th>
          <th>Skills</th>
          <th>Date de création</th>
          <th>Date de mise à jour</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="education in educations" :key="education._id">
          <td>{{ education._id }}</td>
          <td>{{ education.school }}</td>
          <td>{{ education.details }}</td>
          <td>{{ education.program }}</td>
          <td>
              <template v-if="education.skills">
                <span v-for="(skillName, index) in education.skillNames" :key="index">
                  <span v-if="index !== 0">, </span>
                  <span>{{ skillName }}</span>
                </span>
              </template>
            </td>
          <td>{{ education.created_at }}</td>
          <td>{{ education.updated_at }}</td>
          <td>
            <button @click="confirmDelete(education)">Supprimer</button>
            <button @click="redirectToEdit(education._id)">Modifier</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Confirmation de suppression -->
    <div v-if="deleteConfirmation" class="delete-confirmation">
      <p>Voulez-vous vraiment supprimer {{ deleteConfirmation.school }} ?</p>
      <button @click="cancelDelete">Annuler</button>
      <button @click="deleteConfirmed">Confirmer</button>
    </div>

    <!-- Message de succès après la suppression -->
    <div v-if="deleteSuccessMessage" class="delete-success">
      {{ deleteSuccessMessage }} supprimé avec succès.
    </div>
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      educations: [], // Tableau pour stocker les catégories de compétences récupérées
      deleteConfirmation: null, // Stocke temporairement les informations de confirmation de suppression
      deleteSuccessMessage: "" // Message de succès après la suppression
    };
  },
  mounted() {
    this.getEducations(); // Appel de la méthode pour récupérer les catégories de compétences lors du montage du composant
  },
  methods: {
    async getEducations() {
      try {
        const response = await axios.get(`${config.apiUrl}/educations`);
        this.educations = response.data;
      await this.getSkillNames();
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
      }
    },
    async getSkillNames() {
      try {
        // Parcours des compétences
        for (const education of this.educations) {
          // Vérification si skillCategory n'est pas null
          if (education.skills) {
            // Initialisation des noms des catégories pour cette compétence
            education.skillNames = [];
            // Parcours des IDs de catégorie dans skillCategory
            for (const skillId of education.skills) {
              // Requête HTTP pour obtenir le nom de la catégorie
              const response = await axios.get(`${config.apiUrl}/skill/${skillId}`);
              // Ajout du nom de la catégorie à la liste des noms pour cette compétence
              education.skillNames.push(response.data.name);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des noms de catégorie de compétences :", error);
      }
    },
    confirmDelete(education) {
      this.deleteConfirmation = education;
    },
    cancelDelete() {
      this.deleteConfirmation = null;
    },
    async deleteConfirmed() {
  try {
    await axios.delete(`${config.apiUrl}/education/${this.deleteConfirmation._id}`);
    this.deleteSuccessMessage = this.deleteConfirmation.school;
    await this.getEducations(); // Actualiser la liste des catégories après la suppression
    setTimeout(() => {
      this.deleteSuccessMessage = ""; // Effacer le message de succès après quelques secondes
    }, 3000);
    this.deleteConfirmation = null; // Réinitialiser la confirmation de suppression
  } catch (error) {
    console.error("Erreur lors de la suppression de la education :", error);
  }
},

    redirectToEdit(educationId) {
      this.$router.push(`/edit-education/${educationId}`);
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
