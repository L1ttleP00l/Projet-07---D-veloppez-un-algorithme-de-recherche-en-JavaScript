// Retrieves all recipes contained in recipes.js
recipes.forEach(recipe => {
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
    
    document.querySelector(".recipes-card-container").innerHTML += recipeCard;
});


// Global recipes counter
document.addEventListener("DOMContentLoaded", function() {
    // Counting recipes
    const numberOfRecipes = document.querySelectorAll('.recipes-card-container .recipe-card').length;

    // Update h2 content
    document.getElementById('recipe-count').textContent = numberOfRecipes + ' recettes';
});
