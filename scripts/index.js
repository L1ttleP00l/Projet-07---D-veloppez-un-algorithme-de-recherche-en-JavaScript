// UTILITY FUNCTIONS

// Creates a DOM element with optional classes and content
function createElement(type, classNames, content) {
    const element = document.createElement(type);
    if (classNames) element.className = classNames;
    if (content) element.innerHTML = content;
    return element;
}

// Capitalizes the first letter of a character string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Creates an HTML element for an ingredient, to be included in the recipe card
function createIngredientItem(ingredient) {
    return `<div class="ingredient-item">
                <span class="ingredient-name">${ingredient.ingredient}</span>
                <span class="ingredient-quantity">${ingredient.quantity || ''} ${ingredient.unit || ''}</span>
            </div>`;
}

// Create an HTML recipe card from a recipe object
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

// Updates the total number of recipes displayed
function updateRecipeCount(count) {
    document.getElementById('recipe-count').textContent = `${count} recettes`;
}


// RECIPE DISPLAY

// Displays recipes in the appropriate container and updates the counter
function displayRecipes(recipesToDisplay) {
    const recipesContainer = document.querySelector(".recipes-card-container");
    recipesContainer.innerHTML = recipesToDisplay.map(createRecipeCard).join('');
    updateRecipeCount(recipesToDisplay.length);
}


// RECIPE FILTERING

// Retrieves selected filter elements of a given class
function getSelectedFilterItems(filterClass) {
    return Array.from(document.querySelectorAll(filterClass)).map(item => item.textContent.trim().toLowerCase());
}

// Filter recipes according to search criteria and selected filters (functional approach)
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

// Filter recipes according to search criteria and selected filters (native loop approach)
// function filterRecipes(recipes, searchTerm) {
//     const selectedIngredients = getSelectedFilterItems('.selected-ingredients .selected-item');
//     const selectedAppliances = getSelectedFilterItems('.selected-appliances .selected-item');
//     const selectedUstensils = getSelectedFilterItems('.selected-ustensils .selected-item');
//     let filteredRecipes = [];

//     let i = 0;
//     while (i < recipes.length) {
//         const recipe = recipes[i];
//         let ingredientMatches = selectedIngredients.length === 0;
//         let applianceMatches = selectedAppliances.length === 0;
//         let ustensilMatches = selectedUstensils.length === 0;
//         let searchMatches = !searchTerm;

//         // Vérification des ingrédients
//         if (!ingredientMatches) {
//             ingredientMatches = true;
//             let j = 0;
//             while (j < selectedIngredients.length) {
//                 if (!recipe.ingredients.map(ing => ing.ingredient.toLowerCase()).includes(selectedIngredients[j])) {
//                     ingredientMatches = false;
//                     break;
//                 }
//                 j++;
//             }
//         }

//         // Vérification de l'appareil
//         if (!applianceMatches && recipe.appliance) {
//             applianceMatches = selectedAppliances.includes(recipe.appliance.toLowerCase());
//         }

//         // Vérification des ustensiles
//         if (!ustensilMatches) {
//             ustensilMatches = true;
//             let k = 0;
//             while (k < selectedUstensils.length) {
//                 if (!recipe.ustensils.map(ust => ust.toLowerCase()).includes(selectedUstensils[k])) {
//                     ustensilMatches = false;
//                     break;
//                 }
//                 k++;
//             }
//         }

//         // Vérification du terme de recherche
//         if (!searchMatches) {
//             const recipeName = recipe.name.toLowerCase();
//             const recipeDescription = recipe.description.toLowerCase();
//             searchMatches = recipeName.includes(searchTerm) || recipeDescription.includes(searchTerm);
//             if (!searchMatches) {
//                 let l = 0;
//                 while (l < recipe.ingredients.length) {
//                     if (recipe.ingredients[l].ingredient.toLowerCase().includes(searchTerm)) {
//                         searchMatches = true;
//                         break;
//                     }
//                     l++;
//                 }
//             }
//         }

//         if (ingredientMatches && applianceMatches && ustensilMatches && searchMatches) {
//             filteredRecipes.push(recipe);
//         }

//         i++;
//     }

//     return filteredRecipes;
// }


// UPDATE FILTER LISTS

// Extract unique ingredients from all recipes to update filter list
function extractUniqueIngredients(recipes) {
    const allIngredients = recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient.toLowerCase()));
    return [...new Set(allIngredients)].sort();
}

// Extract unique items based on a specific key (e.g., 'appliance' or 'utensils')
function extractUniqueItems(recipes, key) {
    const allItems = recipes.flatMap(recipe => {
        const items = recipe[key];
        return Array.isArray(items) ? items.map(item => item.toLowerCase()) : [items.toLowerCase()];
    });
    return [...new Set(allItems)].sort();
}

// Updates filter list with extracted items
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

// Updates all filter lists based on currently filtered recipes
function updateAllFilterLists(recipes) {
    const uniqueIngredients = extractUniqueIngredients(recipes);
    const uniqueAppliances = extractUniqueItems(recipes, 'appliance');
    const uniqueUstensils = extractUniqueItems(recipes, 'ustensils');

    updateFilterList('ingredients', uniqueIngredients);
    updateFilterList('appliances', uniqueAppliances);
    updateFilterList('ustensils', uniqueUstensils);
}


// MANAGING USER INTERACTION WITH FILTERS

// Manages the selection of a filter element and updates the display accordingly
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

// Global display update based on search and selected filters
function updateDisplay(searchTerm = '') {
    const searchInputValue = searchTerm.toLowerCase();

    if (searchInputValue.length === 0 || searchInputValue.length < 3) {
        searchTerm = '';
    }

    const filteredRecipes = filterRecipes(recipes, searchTerm || searchInputValue);
    displayRecipes(filteredRecipes);
    updateAllFilterLists(filteredRecipes);
}


// Function to filter items in the filter list
function filterFilterListItems(filterType, searchTerm) {
    const filterList = document.querySelector(`#${filterType}-list`);
    const items = filterList.querySelectorAll('li');
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(lowerCaseSearchTerm) ? '' : 'none';
    });
}

// Event listener configuration for filter search
function setupFilterSearchEventListeners() {
    document.querySelectorAll('.filters .search input').forEach(input => {
        const filterType = input.id.split('-')[0]; // 'ingredients', 'appliances', ou 'ustensils'
        
        input.addEventListener('input', (event) => {
            const searchTerm = event.target.value;
            filterFilterListItems(filterType, searchTerm);
        });
    });
}

// Manage filter menu closing interactions
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

// Closes all filter menus
function closeAllFilterMenus() {
    document.querySelectorAll('.filters .content, .filters .select-btn').forEach(element => {
        element.classList.remove('active');
    });

    document.querySelectorAll('.filters .search input').forEach(input => {
        input.value = '';
        input.nextElementSibling.style.display = 'none';
    });
}

// Manages clicks on filter selection buttons to open/close menus
function handleFilterButtonClick(event) {
    const filterContent = event.target.nextElementSibling;
    
    if (filterContent.classList.contains('active')) {
        closeAllFilterMenus();
    } else {
        closeAllFilterMenus();
        filterContent.classList.add('active');
        event.target.classList.add('active');
    }
}

// Initialize event listeners on page load
function setupFilterEventListeners() {
    document.querySelectorAll('.filters .select-btn').forEach(button => {
        button.addEventListener('click', handleFilterButtonClick);
    });
}

// Initial search configuration and display update
function setupSearchPlate() {
    const searchInput = document.getElementById('search-plate');

    searchInput.addEventListener('input', () => {
        const searchInputValue = searchInput.value.toLowerCase();
        if (searchInputValue === '' || searchInputValue.length >= 3) {
            updateDisplay(searchInputValue);
        } else {
            updateDisplay();
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
        }
    });
}

// Global initialization on document loading
document.addEventListener('DOMContentLoaded', () => {
    setupFilterEventListeners();
    setupSearchPlate();
    setupFilterSearchEventListeners();
    updateDisplay();

    document.querySelectorAll('.search input').forEach(input => {
        const searchInput = document.getElementById('search-plate');
        const clearIcon = document.querySelector('form .clear-search');

        searchInput.addEventListener('input', () => {
            clearIcon.style.display = searchInput.value ? 'block' : 'none';
        });

        clearIcon.addEventListener('click', () => {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            updateDisplay();
        });

        const filterSearchInputs = document.querySelectorAll('.filters .dropdown-filter .search input');
        filterSearchInputs.forEach(input => {
            const clearIcon = input.nextElementSibling; // Assumer que l'icône de croix est juste après l'input

            input.addEventListener('input', () => {
                clearIcon.style.display = input.value ? 'block' : 'none';
            });

            clearIcon.addEventListener('click', () => {
                input.value = '';
                clearIcon.style.display = 'none';
            });
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            closeAllFilterMenus();
        }
    });

    
    document.getElementById('search-plate').value = '';
    document.addEventListener('click', handleClickOutside);
});