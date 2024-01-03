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
    const searchInputValue = searchTerm.toLowerCase();

    // Si le champ 'search-plate' est vide ou contient moins de 3 caractères, n'appliquer aucun filtre.
    // Sinon, utilisez les critères de filtrage combinés de 'search-plate' et des autres filtres.
    if (searchInputValue.length === 0 || searchInputValue.length < 3) {
        searchTerm = '';
    }

    const filteredRecipes = filterRecipes(recipes, searchTerm || searchInputValue);
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

// Gestionnaire pour fermer les menus lorsque l'on clique en dehors
function handleClickOutside(event) {
    // Sélectionnez tous les boutons et les contenus de menu
    const selectButtons = document.querySelectorAll('.select-btn');
    const menus = document.querySelectorAll('.content');

    // Vérifier si le clic est en dehors de tous les boutons et de leurs menus
    let isOutside = true;
    selectButtons.forEach((btn, index) => {
        if (btn.contains(event.target) || menus[index].contains(event.target)) {
            isOutside = false;
        }
    });

    if (isOutside) {
        closeAllFilterMenus(); // Utiliser la fonction existante pour fermer les menus
    }
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
    const filterContent = event.target.nextElementSibling;
    
    // Vérifier si le menu est déjà ouvert
    if (filterContent.classList.contains('active')) {
        // Menu ouvert, donc fermer
        closeAllFilterMenus();
    } else {
        // Menu fermé, donc ouvrir
        closeAllFilterMenus(); // Fermer tous les autres menus ouverts
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
        const searchInputValue = searchInput.value.toLowerCase();
        if (searchInputValue === '' || searchInputValue.length >= 3) {
            updateDisplay(searchInputValue);
        } else {
            // Si le champ 'search-plate' est vide ou contient moins de 3 caractères,
            // appelez simplement la fonction updateDisplay() sans critère de recherche.
            updateDisplay();
        }
    });

    // Ajouter un écouteur d'événements pour 'keydown'
    searchInput.addEventListener('keydown', (event) => {
        // Vérifier si la touche appuyée est 'Enter'
        if (event.key === 'Enter' || event.keyCode === 13) {
            // Empêcher le comportement par défaut de la touche Entrée
            event.preventDefault();
        }
    });
}




// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupFilterEventListeners();
    setupSearchPlate();
    setupFilterSearchEventListeners();
    updateDisplay(); // Mise à jour initiale de l'affichage

    // Ajoutez des écouteurs d'événements pour chaque champ de recherche
    document.querySelectorAll('.search input').forEach(input => {
        // Pour search-plate
        const searchInput = document.getElementById('search-plate');
        const clearIcon = document.querySelector('form .clear-search');

        searchInput.addEventListener('input', () => {
            clearIcon.style.display = searchInput.value ? 'block' : 'none';
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            // Mettre à jour l'affichage ou les filtres ici
        });

        // Pour les champs de recherche des filtres
        const filterSearchInputs = document.querySelectorAll('.filters .dropdown-filter .search input');
        filterSearchInputs.forEach(input => {
            const clearIcon = input.nextElementSibling; // Assumer que l'icône de croix est juste après l'input

            input.addEventListener('input', () => {
                clearIcon.style.display = input.value ? 'block' : 'none';
            });

            clearIcon.addEventListener('click', () => {
                input.value = '';
                clearIcon.style.display = 'none';
                // Mettre à jour l'affichage ou les filtres ici
            });
        });
    });

    // Gestionnaire d'événements pour la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            closeAllFilterMenus(); // Appelle la fonction pour fermer les menus
        }
    });

    
    // Vider le champ 'search-plate'
    document.getElementById('search-plate').value = '';

    document.addEventListener('click', handleClickOutside);
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