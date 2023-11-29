// Récupération de toutes les recettes de recipes.js
function displayRecipes(recipesToDisplay) {
    const recipesContainer = document.querySelector(".recipes-card-container");
    recipesContainer.innerHTML = ''; // Effacer les recettes actuelles

    recipesToDisplay.forEach(recipe => {
        let ingredientsList = recipe.ingredients.map(ing => 
            `<div class="ingredient-item">
                <span class="ingredient-name">${ing.ingredient}</span>
                <span class="ingredient-quantity">${ing.quantity || ''} ${ing.unit || ''}</span>
            </div>`
        ).join('');

        let recipeCard = `
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
        
        recipesContainer.innerHTML += recipeCard;
    });

    // Mise à jour du compteur de recettes
    document.getElementById('recipe-count').textContent = recipesToDisplay.length + ' recettes';
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

// Fermeture de tous les menus de filtre
function closeAllFilterMenus() {
    document.querySelectorAll('.filters .content').forEach(menu => {
        menu.classList.remove('active');
    });

    document.querySelectorAll('.filters .select-btn').forEach(button => {
        button.classList.remove('active');
    });

    // Réinitialiser les champs de recherche des filtres et mettre à jour les listes
    document.querySelectorAll('.filters .search input').forEach(input => {
        input.value = '';
        updateFilterList(input.id, '');

        // Cacher l'icône de suppression (croix)
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

    document.addEventListener('click', function(event) {
        const isInsideMenu = event.target.closest('.filters');
        if (!isInsideMenu) {
            closeAllFilterMenus();
        }
    }, true);
});

// Extraction et traitement des données uniques pour chaque catégorie
const uniqueIngredients = new Set();
const uniqueAppliances = new Set();
const uniqueUstensils = new Set();

recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => uniqueIngredients.add(ingredient.ingredient));
    uniqueAppliances.add(recipe.appliance);
    recipe.ustensils.forEach(utensil => uniqueUstensils.add(utensil));
});

function getUniqueSortedData(dataSet) {
    return Array.from(dataSet).map(item => 
        item.charAt(0).toUpperCase() + item.substring(1).toLowerCase()
    ).sort((a, b) => a.localeCompare(b));
}

const sortedUniqueIngredients = getUniqueSortedData(uniqueIngredients);
const sortedUniqueAppliances = getUniqueSortedData(uniqueAppliances);
const sortedUniqueUstensils = getUniqueSortedData(uniqueUstensils);

// Mise à jour de la liste des filtres
function updateFilterList(filterId, searchTerm) {
    const filterType = filterId.split('-')[0];
    let filterData;

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

function handleFilterItemSelection(li, filterType) {
    const selectedItem = li.textContent;
    const selectedContainer = document.querySelector(`.selected-${filterType}`);

    if (!selectedContainer.textContent.includes(selectedItem)) {
        const span = document.createElement('span');
        span.className = 'selected-item';
        span.textContent = selectedItem;
        const closeIcon = document.createElement('i');
        closeIcon.className = 'fa-solid fa-times';
        closeIcon.addEventListener('click', function() {
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

// Initialisation des champs de recherche des filtres
function initSearchField() {
    document.querySelectorAll('.search input').forEach(input => {
        const clearIcon = input.nextElementSibling;

        input.addEventListener('input', function() {
            clearIcon.style.display = this.value ? 'inline' : 'none';
            updateFilterList(this.id, this.value);
        });

        clearIcon.addEventListener('click', function() {
            input.value = '';
            this.style.display = 'none';
            updateFilterList(input.id, '');
            input.focus();
        });
    });
}

// Initialisation des filtres avec des données triées et sans doublons
function initFilterSearch(filterType, filterData) {
    const searchInput = document.querySelector(`#${filterType}-search`);
    updateFilterList(searchInput.id, '');
}

// Appel des fonctions d'initialisation
document.addEventListener('DOMContentLoaded', () => {
    initFilterSearch('ingredients', sortedUniqueIngredients);
    initFilterSearch('appliances', sortedUniqueAppliances);
    initFilterSearch('ustensils', sortedUniqueUstensils);
    initSearchField();
    displayRecipes(recipes);
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialisations existantes
    initFilterSearch('ingredients', sortedUniqueIngredients);
    initFilterSearch('appliances', sortedUniqueAppliances);
    initFilterSearch('ustensils', sortedUniqueUstensils);
    initSearchField();
    displayRecipes(recipes);

    // Gestionnaire pour fermer les filtres avec la touche Échap
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            closeAllFilterMenus();
        }
    });
});
