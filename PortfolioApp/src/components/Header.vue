<template>
  <header>
    <nav>
      <ul>
        <!-- Dropdown pour les compétences -->
        <li>
          <div class="dropdown">
            <button class="dropbtn">Compétences</button>
            <div class="dropdown-content">
              <router-link to="/add-skill">Ajouter une compétence</router-link>
              <router-link to="/get-skills">Liste des compétences</router-link>
            </div>
          </div>
        </li>
        <!-- Dropdown pour les catégories de compétences -->
        <li>
          <div class="dropdown">
            <button class="dropbtn">Catégories de compétences</button>
            <div class="dropdown-content">
              <router-link to="/add-skill-category">Ajouter une catégorie de compétences</router-link>
              <router-link to="/get-skill-categorys">Liste des catégories de compétences</router-link>
            </div>
          </div>
        </li>
        <!-- Dropdown pour les catégories de Certification -->
        <li>
          <div class="dropdown">
            <button class="dropbtn">Catégories de Certification</button>
            <div class="dropdown-content">
              <router-link to="/add-certification">Ajouter une catégorie de Certification</router-link>
              <router-link to="/get-certifications">Liste des catégories de Certification</router-link>
            </div>
          </div>
        </li>
        <!-- Dropdown pour les catégories de education -->
        <li>
          <div class="dropdown">
            <button class="dropbtn">Catégories de education</button>
            <div class="dropdown-content">
              <router-link to="/add-education">Ajouter une catégorie de education</router-link>
              <router-link to="/get-educations">Liste des catégories de education</router-link>
            </div>
          </div>
        </li>
        <!-- Dropdown pour les catégories de education -->
        <li>
          <div class="dropdown">
            <button class="dropbtn">Catégories de experiences</button>
            <div class="dropdown-content">
              <router-link to="/add-experience">Ajouter une catégorie de experiences</router-link>
              <router-link to="/get-experiences">Liste des catégories de experiences</router-link>
            </div>
          </div>
        </li>
      </ul>

    </nav>
  </header>
</template>

<script>
export default {
  name: 'Header'
};
</script>

<style>
/* Styles CSS facultatifs pour le header */
header {
  background-color: #333;
  padding: 20px 0;
}

nav ul {
  list-style-type: none;
  padding: 0;
}

nav ul li {
  display: inline;
  margin-right: 20px;
}

nav ul li .dropdown {
  position: relative;
  display: inline-block;
}

nav ul li .dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  z-index: 1;
}

nav ul li .dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

nav ul li .dropdown-content a:hover {
  background-color: #f1f1f1;
}

nav ul li:hover .dropdown-content {
  display: block;
}

nav ul li .dropbtn {
  background-color: #333;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

nav ul li .dropbtn:hover {
  background-color: #555;
}
</style>
