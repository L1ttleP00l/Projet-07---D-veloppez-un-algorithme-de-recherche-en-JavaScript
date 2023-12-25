// Fonctions utilitaires
function createElement(type, classNames, content) {
    const element = document.createElement(type);
    if (classNames) element.className = classNames;
    if (content) element.innerHTML = content;
    return element;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createIngredientItem(ingredient) {
    return `<div class="ingredient-item">
                <span class="ingredient-name">${ingredient.ingredient}</span>
                <span class="ingredient-quantity">${ingredient.quantity || ''} ${ingredient.unit || ''}</span>
            </div>`;
}

function createRecipeCard(recipe) {
    const ingredientsList = recipe.ingredients.map(createIngredientItem).join('');
    return `
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
}

function updateRecipeCount(count) {
    document.getElementById('recipe-count').textContent = `${count} recettes`;
}

// Affichage des recettes
function displayRecipes(recipesToDisplay) {
    const recipesContainer = document.querySelector(".recipes-card-container");
    recipesContainer.innerHTML = recipesToDisplay.map(createRecipeCard).join('');
    updateRecipeCount(recipesToDisplay.length);
}

// Filtrage des recettes
function getSelectedFilterItems(filterClass) {
    return Array.from(document.querySelectorAll(filterClass)).map(item => item.textContent.trim().toLowerCase());
}

function filterRecipes(recipes, searchTerm) {
    const selectedIngredients = getSelectedFilterItems('.selected-ingredients .selected-item');
    const selectedAppliances = getSelectedFilterItems('.selected-appliances .selected-item');
    const selectedUstensils = getSelectedFilterItems('.selected-ustensils .selected-item');

    return recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.ingredient.toLowerCase());
        const recipeAppliances = recipe.appliance ? recipe.appliance.toLowerCase() : '';
        const recipeUstensils = recipe.ustensils.map(ustensil => ustensil.toLowerCase());

        const ingredientMatches = selectedIngredients.length === 0 || selectedIngredients.every(ing => recipeIngredients.includes(ing));
        const applianceMatches = selectedAppliances.length === 0 || selectedAppliances.some(appl => recipeAppliances.includes(appl));
        const ustensilMatches = selectedUstensils.length === 0 || selectedUstensils.every(ust => recipeUstensils.includes(ust));
        const searchMatches = !searchTerm || recipe.name.toLowerCase().includes(searchTerm) ||
                              recipe.description.toLowerCase().includes(searchTerm) ||
                              recipe.ingredients.some(ing => ing.ingredient.toLowerCase().includes(searchTerm));

        return ingredientMatches && applianceMatches && ustensilMatches && searchMatches;
    });
}

// Extraction et mise à jour des listes de filtres
function extractUniqueIngredients(recipes) {
    const allIngredients = recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient.toLowerCase()));
    return [...new Set(allIngredients)].sort();
}

function extractUniqueItems(recipes, key) {
    const allItems = recipes.flatMap(recipe => {
        const items = recipe[key];
        return Array.isArray(items) ? items.map(item => item.toLowerCase()) : [items.toLowerCase()];
    });
    return [...new Set(allItems)].sort();
}

function updateFilterList(filterType, items) {
    const filterList = document.querySelector(`#${filterType}-list`);
    filterList.innerHTML = '';
    items.forEach(item => {
        const capitalizedItem = capitalizeFirstLetter(item);
        const li = createElement('li', '', capitalizedItem);
        li.addEventListener('click', () => {
            handleFilterItemSelection(capitalizedItem, filterType);
        });
        filterList.appendChild(li);
    });
}

function updateAllFilterLists(recipes) {
    const uniqueIngredients = extractUniqueIngredients(recipes);
    const uniqueAppliances = extractUniqueItems(recipes, 'appliance');
    const uniqueUstensils = extractUniqueItems(recipes, 'ustensils');

    updateFilterList('ingredients', uniqueIngredients);
    updateFilterList('appliances', uniqueAppliances);
    updateFilterList('ustensils', uniqueUstensils);
}

// Gestionnaire pour la sélection d'un élément de filtre
function handleFilterItemSelection(item, filterType) {
    const selectedContainer = document.querySelector(`.selected-${filterType}`);
    const selectedItem = createElement('span', 'selected-item', item);

    const closeIcon = document.createElement('i');
    closeIcon.classList.add('fa-solid', 'fa-times');
    closeIcon.addEventListener('click', function () {
        selectedItem.remove();
        updateDisplay(document.getElementById('search-plate').value);
    });

    selectedItem.appendChild(closeIcon);
    selectedContainer.appendChild(selectedItem);
    updateDisplay(document.getElementById('search-plate').value);
}

// Mise à jour de l'affichage des recettes et des listes de filtres
function updateDisplay(searchTerm = '') {
    const searchInputValue = document.getElementById('search-plate').value.toLowerCase();
    const filteredRecipes = filterRecipes(recipes, searchInputValue);
    displayRecipes(filteredRecipes);
    updateAllFilterLists(filteredRecipes);
}

// Fonction pour filtrer les éléments de la liste de filtres
function filterFilterListItems(filterType, searchTerm) {
    const filterList = document.querySelector(`#${filterType}-list`);
    const items = filterList.querySelectorAll('li');
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(lowerCaseSearchTerm) ? '' : 'none';
    });
}

// Gestionnaire d'événements pour les champs de recherche des filtres
function setupFilterSearchEventListeners() {
    document.querySelectorAll('.filters .search input').forEach(input => {
        const filterType = input.id.split('-')[0]; // 'ingredients', 'appliances', ou 'ustensils'
        
        input.addEventListener('input', (event) => {
            const searchTerm = event.target.value;
            filterFilterListItems(filterType, searchTerm);
        });
    });
}

// Gestion des événements de filtre
function closeAllFilterMenus() {
    document.querySelectorAll('.filters .content, .filters .select-btn').forEach(element => {
        element.classList.remove('active');
    });

    document.querySelectorAll('.filters .search input').forEach(input => {
        input.value = '';
        input.nextElementSibling.style.display = 'none';
    });
}

function handleFilterButtonClick(event) {
    closeAllFilterMenus();
    const filterContent = event.target.nextElementSibling;
    if (!filterContent.classList.contains('active')) {
        filterContent.classList.add('active');
        event.target.classList.add('active');
    }
}

function setupFilterEventListeners() {
    document.querySelectorAll('.filters .select-btn').forEach(button => {
        button.addEventListener('click', handleFilterButtonClick);
    });
}

function setupSearchPlate() {
    const searchInput = document.getElementById('search-plate');

    searchInput.addEventListener('input', () => {
        updateDisplay(searchInput.value);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupFilterEventListeners();
    setupSearchPlate();
    setupFilterSearchEventListeners();
    updateDisplay(); // Mise à jour initiale de l'affichage
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