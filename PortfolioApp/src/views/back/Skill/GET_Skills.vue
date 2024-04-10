<template>
    <div>
      <h1>Liste des compétences</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Logo</th>
            <th>Note</th>
            <th>Catégories</th>
            <th>Date de création</th>
            <th>Date de mise à jour</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="skill in skills" :key="skill._id">
            <td>{{ skill._id }}</td>
            <td>{{ skill.name }}</td>
            <td><img :src="`${URLapi}${skill.logo}`" alt="" width=25px ></td>
            <td>{{ skill.rating }}</td>
            <td>
              <template v-if="skill.skillCategoryNames">
                <span v-for="(categoryName, index) in skill.skillCategoryNames" :key="index">
                  <span v-if="index !== 0">, </span>
                  <span>{{ categoryName }}</span>
                </span>
              </template>
            </td>
            <td>{{ skill.created_at }}</td>
            <td>{{ skill.updated_at }}</td>
            <td>
              <button @click="confirmDelete(skill)">Supprimer</button>
              <button @click="redirectToEdit(skill._id)">Modifier</button>
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
        skills: [], // Tableau pour stocker les compétences récupérées
        deleteConfirmation: null, // Stocke temporairement les informations de confirmation de suppression
        deleteSuccessMessage: "", // Message de succès après la suppression
        URLapi: config.apiUrl
      };
    },
    mounted() {
      this.getSkills(); // Appel de la méthode pour récupérer les compétences lors du montage du composant
    },
    methods: {
      async getSkills() {
        try {
          const response = await axios.get(`${config.apiUrl}/skills`);
          this.skills = response.data;
          // Appel de la méthode pour obtenir les noms des catégories de compétences
          await this.getCategoryNames();
        } catch (error) {
          console.error("Erreur lors de la récupération des compétences :", error);
        }
      },
      async getCategoryNames() {
        try {
          // Parcours des compétences
          for (const skill of this.skills) {
            // Vérification si skillCategory n'est pas null
            if (skill.skillCategory) {
              // Initialisation des noms des catégories pour cette compétence
              skill.skillCategoryNames = [];
              // Parcours des IDs de catégorie dans skillCategory
              for (const categoryId of skill.skillCategory) {
                // Requête HTTP pour obtenir le nom de la catégorie
                const response = await axios.get(`${config.apiUrl}/skillCategory/${categoryId}`);
                // Ajout du nom de la catégorie à la liste des noms pour cette compétence
                skill.skillCategoryNames.push(response.data.name);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des noms de catégorie de compétences :", error);
        }
      },
      confirmDelete(skill) { 
        this.deleteConfirmation = skill;
      },
      cancelDelete() {
        this.deleteConfirmation = null;
      },
      async deleteConfirmed() {
        try {
          await axios.delete(`${config.apiUrl}/skill/${this.deleteConfirmation._id}`);
          this.deleteSuccessMessage = this.deleteConfirmation.name;
          await this.getSkills(); // Actualiser la liste des compétences après la suppression
          setTimeout(() => {
            this.deleteSuccessMessage = ""; // Effacer le message de succès après quelques secondes
          }, 3000);
          this.deleteConfirmation = null; // Réinitialiser la confirmation de suppression
        } catch (error) {
          console.error("Erreur lors de la suppression de la compétence :", error);
        }
      },
      redirectToEdit(skillId) {
        this.$router.push(`/edit-skill/${skillId}`);
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
  