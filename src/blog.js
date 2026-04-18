import { articles } from "./data/articles.js";
import { sanitizeText } from "./utils/sanitize.js";

document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById("articles");
    const searchInput = document.getElementById("search-input");
    const resultsStatus = document.getElementById("results-status");

    if (!articlesContainer) {
        console.error('Element with id "articles" not found.');
        return;
    }

    const renderArticleCard = (article) => {
        const safeTitle = sanitizeText(article.title);
        const safeCategory = sanitizeText(article.category);
        const safeExcerpt = sanitizeText(article.excerpt);
        const safeImage = sanitizeText(article.image);

        return `
            <div class="article">
                <a href="article.html?title=${encodeURIComponent(article.title)}" class="article-link" aria-label="Read ${safeTitle}">
                    <img src="assets/articleImages/${safeImage}" alt="${safeTitle}">
                    <div class="article-content">
                        <div class="article-category">${safeCategory}</div>
                        <h2 class="article-title">${safeTitle}</h2>
                        <p class="article-excerpt">${safeExcerpt}</p>
                    </div>
                </a>
            </div>
        `;
    };

    const renderEmptyState = (filter) => {
        const cleanFilter = sanitizeText(filter);
        articlesContainer.innerHTML = `
            <div class="empty-state">
                <h2>No articles found</h2>
                <p>No category matched "${cleanFilter}". Try Climate, Geology, Oceanography, Astronomy, Ecology, or Environmental Science.</p>
            </div>
        `;
    };

    const updateStatus = (count, filter) => {
        if (!resultsStatus) {
            return;
        }

        if (!filter) {
            resultsStatus.textContent = `Showing all ${count} articles.`;
            return;
        }

        resultsStatus.textContent = `Showing ${count} article${count === 1 ? "" : "s"} for "${filter}".`;
    };

    const renderArticles = (filter = "") => {
        const normalizedFilter = filter.trim().toLowerCase();
        const filteredArticles = articles.filter((article) =>
            article.category.toLowerCase().includes(normalizedFilter)
        );

        if (!filteredArticles.length) {
            renderEmptyState(filter.trim());
            updateStatus(0, filter.trim());
            return;
        }

        articlesContainer.innerHTML = filteredArticles.map(renderArticleCard).join("");
        updateStatus(filteredArticles.length, filter.trim());
    };

    renderArticles();

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            renderArticles(event.target.value);
        });
    }
});
  
