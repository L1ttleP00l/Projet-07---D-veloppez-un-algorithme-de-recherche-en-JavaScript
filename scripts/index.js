// Fonction pour afficher les recettes
function displayRecipes(recipesToDisplay) {
    const recipesContainer = document.querySelector(".recipes-card-container");
    recipesContainer.innerHTML = '';

    recipesToDisplay.forEach(recipe => {
        const ingredientsList = recipe.ingredients.map(ing =>
            `<div class="ingredient-item">
                <span class="ingredient-name">${ing.ingredient}</span>
                <span class="ingredient-quantity">${ing.quantity || ''} ${ing.unit || ''}</span>
            </div>`
        ).join('');

        const recipeCard = `
            <div class="recipe-card">
                <div class="picture-info">
                    <img src="assets/photos/${recipe.image}" alt="${recipe.name}">
                    <span class="prep-time">${recipe.time} min</span>
                </div>
                <div class="recipe">
                    <h3 class="recipe-name">${recipe.name}</h3>
                    <h4>RECETTE</h4>
                    <p>${recipe.description}</p>
                    <h4>INGRÉDIENTS</h4>
                    <div class="ingredients-list">${ingredientsList}</div>
                </div>
            </div>`;

        recipesContainer.insertAdjacentHTML('beforeend', recipeCard);
    });

    // Mettre à jour le compteur de recettes
    document.getElementById('recipe-count').textContent = recipesToDisplay.length + ' recettes';

    updateFilterList('ingredients-search', '', recipesToDisplay);
    updateFilterList('appliances-search', '', recipesToDisplay);
    updateFilterList('ustensils-search', '', recipesToDisplay);
}

// Fonction de filtrage des recettes
function filterRecipes() {
    const selectedIngredients = Array.from(document.querySelectorAll('.selected-ingredients .selected-item'))
        .map(item => item.textContent.trim());
    const selectedAppliances = Array.from(document.querySelectorAll('.selected-appliances .selected-item'))
        .map(item => item.textContent.trim());
    const selectedUstensils = Array.from(document.querySelectorAll('.selected-ustensils .selected-item'))
        .map(item => item.textContent.trim());

    return recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(ingredient => ingredient.ingredient);
        const recipeAppliance = recipe.appliance;
        const recipeUstensils = recipe.ustensils;

        const matchesIngredients = selectedIngredients.length === 0 || selectedIngredients.every(ingredient => recipeIngredients.includes(ingredient));
        const matchesAppliances = selectedAppliances.length === 0 || selectedAppliances.includes(recipeAppliance);
        const matchesUstensils = selectedUstensils.length === 0 || selectedUstensils.every(utensil => recipeUstensils.includes(utensil));

        return matchesIngredients && matchesAppliances && matchesUstensils;
    });
}

// Fonction pour fermer tous les menus de filtre
function closeAllFilterMenus() {
    document.querySelectorAll('.filters .content').forEach(menu => {
        menu.classList.remove('active');
    });

    document.querySelectorAll('.filters .select-btn').forEach(button => {
        button.classList.remove('active');
    });

    // Réinitialiser les champs de recherche de filtre et mettre à jour les listes
    document.querySelectorAll('.filters .search input').forEach(input => {
        input.value = '';
        // updateFilterList(input.id, '', recipes);

        // Masquer l'icône de suppression (croix)
        const clearIcon = input.nextElementSibling;
        if (clearIcon) {
            clearIcon.style.display = 'none';
        }
    });
}

// Gestion des filtres
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filters .select-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterContent = button.nextElementSibling;
            const isAlreadyOpen = [...filterContent.classList].includes('active');
            closeAllFilterMenus();

            if (!isAlreadyOpen) {
                filterContent.classList.add('active');
                button.classList.add('active');
            }
        });
    });

    document.addEventListener('click', function (event) {
        const isInsideMenu = event.target.closest('.filters');
        if (!isInsideMenu) {
            closeAllFilterMenus();
        }
    }, true);
});

// // Extraction et traitement des données uniques pour chaque catégorie
// const uniqueIngredients = new Set();
// const uniqueAppliances = new Set();
// const uniqueUstensils = new Set();

// recipes.forEach(recipe => {
//     recipe.ingredients.forEach(ingredient => uniqueIngredients.add(ingredient.ingredient));
//     uniqueAppliances.add(recipe.appliance);
//     recipe.ustensils.forEach(utensil => uniqueUstensils.add(utensil));
// });

// // Fonction pour obtenir des données uniques triées
// function getUniqueSortedData(dataSet) {
//     return Array.from(dataSet).map(item =>
//         item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
//     ).sort((a, b) => a.localeCompare(b));
// }

// const sortedUniqueIngredients = getUniqueSortedData(uniqueIngredients);
// const sortedUniqueAppliances = getUniqueSortedData(uniqueAppliances);
// const sortedUniqueUstensils = getUniqueSortedData(uniqueUstensils);

function myFunction(recipes) {
    // Extraction et traitement des données uniques pour chaque catégorie
    const uniqueIngredients = new Set();
    const uniqueAppliances = new Set();
    const uniqueUstensils = new Set();

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => uniqueIngredients.add(ingredient.ingredient));
        uniqueAppliances.add(recipe.appliance);
        recipe.ustensils.forEach(utensil => uniqueUstensils.add(utensil));
    });

    // Fonction pour obtenir des données uniques triées
    function getUniqueSortedData(dataSet) {
        return Array.from(dataSet).map(item =>
            item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
        ).sort((a, b) => a.localeCompare(b));
    }

    const sortedUniqueIngredients = getUniqueSortedData(uniqueIngredients);
    const sortedUniqueAppliances = getUniqueSortedData(uniqueAppliances);
    const sortedUniqueUstensils = getUniqueSortedData(uniqueUstensils);

    return [ sortedUniqueIngredients, sortedUniqueAppliances, sortedUniqueUstensils ]
}

const [ sortedUniqueIngredients, sortedUniqueAppliances, sortedUniqueUstensils ] = myFunction(recipes)


// Mettre à jour la liste de filtre
function updateFilterList(filterId, searchTerm, filteredRecipes) {
    const [ sortedUniqueIngredients, sortedUniqueAppliances, sortedUniqueUstensils ] = myFunction(filteredRecipes)
    const filterType = filterId.split('-')[0];
    let filterData;

    console.log(sortedUniqueAppliances,sortedUniqueIngredients,sortedUniqueUstensils)

    switch (filterType) {
        case 'ingredients':
            filterData = sortedUniqueIngredients;
            break;
        case 'appliances':
            filterData = sortedUniqueAppliances;
            break;
        case 'ustensils':
            filterData = sortedUniqueUstensils;
            break;
        default:
            return;
    }

    const filterList = document.querySelector(`#${filterType}-list`);
    filterList.innerHTML = '';
    filterData.forEach(item => {
        if (item.toLowerCase().includes(searchTerm.toLowerCase())) {
            const li = document.createElement('li');
            li.textContent = item;
            li.addEventListener('click', () => {
                handleFilterItemSelection(li, filterType);
            });
            filterList.appendChild(li);
        }
    });
}

// Gérer la sélection d'un élément de filtre
function handleFilterItemSelection(li, filterType) {
    const selectedItem = li.textContent;
    const selectedContainer = document.querySelector(`.selected-${filterType}`);

    if (!selectedContainer.textContent.includes(selectedItem)) {
        const span = document.createElement('span');
        span.classList.add('selected-item');
        span.textContent = selectedItem;
        const closeIcon = document.createElement('i');
        closeIcon.classList.add('fa-solid', 'fa-times');
        closeIcon.addEventListener('click', function () {
            span.remove();
            const filteredRecipes = filterRecipes();
            displayRecipes(filteredRecipes);
        });
        span.appendChild(closeIcon);
        selectedContainer.appendChild(span);

        const filteredRecipes = filterRecipes();
        displayRecipes(filteredRecipes);
    }
}

// Initialiser les champs de recherche de filtre
function initSearchField() {
    document.querySelectorAll('.search input').forEach(input => {
        const clearIcon = input.nextElementSibling;

        input.addEventListener('input', function () {
            clearIcon.style.display = this.value ? 'inline' : 'none';
            updateFilterList(this.id, this.value, recipes);
        });

        clearIcon.addEventListener('click', function () {
            input.value = '';
            this.style.display = 'none';
            updateFilterList(input.id, '', recipes);
            input.focus();
        });
    });
}

// Initialiser les filtres avec des données triées et non dupliquées
function initFilterSearch(filterType, filterData) {
    const searchInput = document.querySelector(`#${filterType}-search`);
    updateFilterList(searchInput.id, '', recipes);
}

// Appeler les fonctions d'initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Réinitialise le contenu de search-plate à chaque rafraîchissement de la page
    document.getElementById('search-plate').value = '';

    initFilterSearch('ingredients', sortedUniqueIngredients);
    initFilterSearch('appliances', sortedUniqueAppliances);
    initFilterSearch('ustensils', sortedUniqueUstensils);
    initSearchField();
    displayRecipes(recipes);

    // Gestionnaire pour fermer les filtres avec la touche Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllFilterMenus();
        }
    });
});

// Gestionnaire pour rafraîchir la liste de recettes lorsque la zone de recherche est vide
document.getElementById('search-plate').addEventListener('input', (event) => {
    const searchTerm = event.target.value;

    if (searchTerm.length >= 3) {
        const filteredRecipes = searchRecipesWithFunctionalProgramming(searchTerm);
        displayRecipes(filteredRecipes);
    } else {
        displayRecipes(recipes);
    }
});

// Fonction de recherche en utilisant la programmation fonctionnelle
function searchRecipesWithFunctionalProgramming(keyword) {
    return recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(keyword.toLowerCase()) ||
        recipe.description.toLowerCase().includes(keyword.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(keyword.toLowerCase())) ||
        recipe.appliance.toLowerCase().includes(keyword.toLowerCase()) ||
        recipe.ustensils.some(ustensil => ustensil.toLowerCase().includes(keyword.toLowerCase()))
    );
}

// Gestionnaire pour soumettre le formulaire de recherche
document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('search-plate').value;
    const filteredRecipes = searchRecipesWithFunctionalProgramming(searchTerm);
    displayRecipes(filteredRecipes);
});

// Search function using loops
// function searchRecipesWithLoops(keyword) {
//     let results = [];
//     for (let i = 0; i < recipes.length; i++) {
//         const recipe = recipes[i];
//         let keywordMatch = recipe.name.toLowerCase().includes(keyword.toLowerCase()) ||
//                            recipe.description.toLowerCase().includes(keyword.toLowerCase()) ||
//                            recipe.appliance.toLowerCase().includes(keyword.toLowerCase());

//         if (!keywordMatch) {
//             // Vérifier les ingrédients avec une boucle for
//             for (let j = 0; j < recipe.ingredients.length; j++) {
//                 if (recipe.ingredients[j].ingredient.toLowerCase().includes(keyword.toLowerCase())) {
//                     keywordMatch = true;
//                     break; // Quitter la boucle dès qu'une correspondance est trouvée
//                 }
//             }
//         }

//         if (!keywordMatch) {
//             // Vérifier les ustensiles avec une boucle for
//             for (let k = 0; k < recipe.ustensils.length; k++) {
//                 if (recipe.ustensils[k].toLowerCase().includes(keyword.toLowerCase())) {
//                     keywordMatch = true;
//                     break; // Quitter la boucle dès qu'une correspondance est trouvée
//                 }
//             }
//         }

//         if (keywordMatch) {
//             results.push(recipe);
//         }
//     }
//     return results;
// }

// document.querySelector('form').addEventListener('submit', (event) => {
//     event.preventDefault();
//     const searchTerm = document.getElementById('search-plate').value;
//     const filteredRecipes = searchRecipesWithLoops(searchTerm);
//     displayRecipes(filteredRecipes);
// });