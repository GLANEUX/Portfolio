# BUG

## Mon but

Mon but est dans le formulaire insérer un fichier (png ou jpg) puis, l'envoyer vers le controller qui fera toutes les vérification puis si toutes les vérification sont correcti ont télécharge l'image dans le dossier uploads de l'API.

## Situation actuelle
Pour télécharger mon image je passe d'abord dans la vue qui récupères les différentes infos du formulaire dont le file et les envoie vers la route /skill. Je passais par un middleware fileUploadMiddleware qui téléchargais mon image *mais avant la vérification du formulaire*.

J'ai donc voulu faire le contraire en mettant le téléchargement du fichier dans ma fonction CreateSkill, j'ai donc enlever le middleware sauf que plus aucune donner n'apparais dans mon body.

## Théorie
Via un débug la constation est que c'est le faite (dans la vue) de faire passer les information en 'Content-Type': 'multipart/form-data' qui ferait buger.


## Configuration
## Installation
```
$ cd API
$ npm start
```
```
$ cd PortfolioApp
$ npm run dev
```

## fichiers
- Portfolio/src/views/back/Skill/POST_Skill.vue
- API/src/routes/skillRoutes.js
- API/src/middleware/fileUploadMiddleware.js
- API/src/controllers/skillController.js
- API/src/uploads


## Autres 
Front :
- Axios: Gère l'api ([Doc](https://axios-http.com/docs/multipart))

Back :
- Multer gère le téléchargement d'images ([Doc](https://www.npmjs.com/package/multer))