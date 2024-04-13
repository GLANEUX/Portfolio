<template>
  <div>
    <h1>Liste des cproject</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Details</th>
          <th>shortDescription</th>
          <th>Skills</th>
          <th>Date de création</th>
          <th>Date de mise à jour</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project._id">
          <td>{{ project._id }}</td>
          <td>{{ project.name }}</td>
          <td>{{ project.details }}</td>
          <td>{{ project.shortDescription }}</td>
          <td>
            <template v-if="project.skills">
              <span v-for="(skillName, index) in project.skillNames" :key="index">
                <span v-if="index !== 0">, </span>
                <span>{{ skillName }}</span>
              </span>
            </template>
          </td>
          <td>{{ project.created_at }}</td>
          <td>{{ project.updated_at }}</td>
          <td>
            <button @click="confirmDelete(project)">Supprimer</button>
            <button @click="redirectToEdit(project._id)">Modifier</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Confirmation de suppression -->
    <div v-if="deleteConfirmation" class="delete-confirmation">
      <p>Voulez-vous vraiment supprimer {{ deleteConfirmation.name }} ?</p>
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
      projects: [], // Tableau pour stocker les catégories de compétences récupérées
      deleteConfirmation: null, // Stocke temporairement les informations de confirmation de suppression
      deleteSuccessMessage: "" // Message de succès après la suppression
    };
  },
  mounted() {
    this.getProjects(); // Appel de la méthode pour récupérer les catégories de compétences lors du montage du composant
  },
  methods: {
    async getProjects() {
      try {
        const response = await axios.get(`${config.apiUrl}/projects`);
        this.projects = response.data;
        await this.getSkillNames();
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences :", error);
      }
    },
    async getSkillNames() {
      try {
        // Parcours des compétences
        for (const project of this.projects) {
          // Vérification si skillCategory n'est pas null
          if (project.skills) {
            // Initialisation des noms des catégories pour cette compétence
            project.skillNames = [];
            // Parcours des IDs de catégorie dans skillCategory
            for (const skillId of project.skills) {
              // Requête HTTP pour obtenir le nom de la catégorie
              const response = await axios.get(`${config.apiUrl}/skill/${skillId}`);
              // Ajout du nom de la catégorie à la liste des noms pour cette compétence
              project.skillNames.push(response.data.name);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des noms de catégorie de compétences :", error);
      }
    },
    confirmDelete(project) {
      this.deleteConfirmation = project;
    },
    cancelDelete() {
      this.deleteConfirmation = null;
    },
    async deleteConfirmed() {
      try {
        await axios.delete(`${config.apiUrl}/project/${this.deleteConfirmation._id}`);
        this.deleteSuccessMessage = this.deleteConfirmation.name;
        await this.getProjects(); // Actualiser la liste des catégories après la suppression
        setTimeout(() => {
          this.deleteSuccessMessage = ""; // Effacer le message de succès après quelques secondes
        }, 3000);
        this.deleteConfirmation = null; // Réinitialiser la confirmation de suppression
      } catch (error) {
        console.error("Erreur lors de la suppression de la project :", error);
      }
    },

    redirectToEdit(projectId) {
      this.$router.push(`/edit-project/${projectId}`);
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
