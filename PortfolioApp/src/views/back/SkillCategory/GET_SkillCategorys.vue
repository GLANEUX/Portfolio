<template>
  <div>
    <h1>Liste des catégories de compétences</h1>
    <div v-if="categories.length === 0">
      <p>Aucune skillcategories pour le moment.</p>
      <!-- Lien vers la création d'une nouvelle éducation -->
      <router-link to="/add-skill-category">Créer une nouvelle skillcategories</router-link>
    </div>

    <div v-else>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Date de création</th>
          <th>Date de mise à jour</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category._id">
          <td>{{ category._id }}</td>
          <td>{{ category.name }}</td>
          <td>{{ category.created_at }}</td>
          <td>{{ category.updated_at }}</td>
          <td>
              <button @click="confirmDelete(category)">Supprimer</button>
              <button @click="redirectToEdit(category._id)">Modifier</button>
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
  </div>
</template>

<script>
import axios from "axios";
import config from "@/config.js"; // Importez le fichier de configuration

export default {
  data() {
    return {
      categories: [], // Tableau pour stocker les catégories de compétences récupérées
      deleteConfirmation: null, // Stocke temporairement les informations de confirmation de suppression
      deleteSuccessMessage: "" // Message de succès après la suppression
    };
  },
  mounted() {
    this.getSkillCategories(); // Appel de la méthode pour récupérer les catégories de compétences lors du montage du composant
  },
  methods: {
    async getSkillCategories() {
      try {
        const response = await axios.get(`${config.apiUrl}/skillCategorys`);
        this.categories = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories de compétences :", error);
      }
    },
    confirmDelete(category) {
      this.deleteConfirmation = category;
    },
    cancelDelete() {
      this.deleteConfirmation = null;
    },
    async deleteConfirmed() {
  try {
    await axios.delete(`${config.apiUrl}/skillCategory/${this.deleteConfirmation._id}`);
    this.deleteSuccessMessage = this.deleteConfirmation.name;
    await this.getSkillCategories(); // Actualiser la liste des catégories après la suppression
    setTimeout(() => {
      this.deleteSuccessMessage = ""; // Effacer le message de succès après quelques secondes
    }, 3000);
    this.deleteConfirmation = null; // Réinitialiser la confirmation de suppression
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie de compétences :", error);
  }
},

    redirectToEdit(categoryId) {
      this.$router.push(`/edit-skill-category/${categoryId}`);
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
