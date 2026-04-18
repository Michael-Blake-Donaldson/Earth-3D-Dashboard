import { articles } from "./data/articles.js";
import { normalizeQueryValue, sanitizeText } from "./utils/sanitize.js";

const pageLoader = document.getElementById("page-loader");
const articleContainer = document.getElementById("article-container");

const formatArticleContent = (content) => {
  const safeContent = sanitizeText(content)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

  // Render each text block as a paragraph while preserving line breaks between ideas.
  return safeContent
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
};

const renderNotFound = (message) => {
  articleContainer.innerHTML = `
        <article class="article">
            <h2>Article Not Found</h2>
            <p>${sanitizeText(message)}</p>
            <p>Please return to the blog list and select a valid article.</p>
        </article>
    `;
};

if (!articleContainer) {
  console.error('Element with id "article-container" not found.');
} else {
  const params = new URLSearchParams(window.location.search);
  const articleTitle = normalizeQueryValue(params.get("title"));

  if (!articleTitle) {
    renderNotFound("No article title was provided in the URL.");
  } else {
    const article = articles.find((entry) => entry.title === articleTitle);

    if (!article) {
      renderNotFound(`No article matched the title "${articleTitle}".`);
    } else {
      articleContainer.innerHTML = `
                <article class="article">
                    <img src="assets/articleImages/${sanitizeText(article.image)}" alt="${sanitizeText(article.title)}">
                    <div class="article-content">
                        <h2>${sanitizeText(article.title)}</h2>
                        <p class="article-meta"><strong>Category:</strong> ${sanitizeText(article.category)}</p>
                        ${formatArticleContent(article.content)}
                    </div>
                </article>
            `;
    }
  }
}

if (pageLoader) {
  window.setTimeout(() => {
    pageLoader.classList.add("hidden");
    document.body.classList.remove("loading");
  }, 180);
} else {
  document.body.classList.remove("loading");
}
