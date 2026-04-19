import { articles } from "./data/articles.js";
import { sanitizeText } from "./utils/sanitize.js";
import { filterArticlesByCategory } from "./utils/articles.js";

document.addEventListener("DOMContentLoaded", () => {
  const pageLoader = document.getElementById("page-loader");
  const articlesContainer = document.getElementById("articles");
  const searchInput = document.getElementById("search-input");
  const resultsStatus = document.getElementById("results-status");
  const categoryFilters = document.getElementById("category-filters");
  const allCategories = [...new Set(articles.map((article) => article.category))].sort();
  let activeCategory = "";
  let renderToken = 0;

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
            <img src="assets/articleImages/${safeImage}" alt="${safeTitle}" loading="lazy" decoding="async" fetchpriority="low">
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

  const applyCardStagger = () => {
    const cards = articlesContainer.querySelectorAll(".article");
    cards.forEach((card, index) => {
      card.style.setProperty("--stagger-index", String(index));
    });
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

  const setActiveChip = (category) => {
    if (!categoryFilters) {
      return;
    }

    const chips = categoryFilters.querySelectorAll(".category-chip");
    chips.forEach((chip) => {
      const isMatch = chip.dataset.category === category;
      chip.classList.toggle("active", isMatch);
      chip.setAttribute("aria-pressed", String(isMatch));
    });
  };

  const renderCategoryFilters = () => {
    if (!categoryFilters) {
      return;
    }

    const allFilters = ["All", ...allCategories];
    categoryFilters.innerHTML = allFilters
      .map((category) => {
        const dataCategory = category === "All" ? "" : category;
        return `<button type="button" class="category-chip" data-category="${sanitizeText(dataCategory)}" aria-pressed="false">${sanitizeText(category)}</button>`;
      })
      .join("");

    categoryFilters.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      activeCategory = target.dataset.category || "";
      if (searchInput) {
        searchInput.value = activeCategory;
      }
      renderArticles(activeCategory);
    });

    setActiveChip("");
  };

  const renderArticles = (filter = "") => {
    const token = renderToken + 1;
    renderToken = token;
    articlesContainer.classList.add("is-filtering");

    const normalizedFilter = filter.trim().toLowerCase();
    const filteredArticles = filterArticlesByCategory(articles, normalizedFilter);

    activeCategory =
      allCategories.find((category) => category.toLowerCase() === normalizedFilter) || "";
    setActiveChip(activeCategory);

    window.setTimeout(() => {
      if (token !== renderToken) {
        return;
      }

      if (!filteredArticles.length) {
        renderEmptyState(filter.trim());
        updateStatus(0, filter.trim());
        articlesContainer.classList.remove("is-filtering");
        return;
      }

      articlesContainer.innerHTML = filteredArticles.map(renderArticleCard).join("");
      applyCardStagger();
      updateStatus(filteredArticles.length, filter.trim());
      articlesContainer.classList.remove("is-filtering");
    }, 90);
  };

  renderArticles();
  renderCategoryFilters();

  if (pageLoader) {
    window.setTimeout(() => {
      pageLoader.classList.add("hidden");
      document.body.classList.remove("loading");
    }, 180);
  } else {
    document.body.classList.remove("loading");
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      renderArticles(event.target.value);
    });
  }
});
