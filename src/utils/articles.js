export function filterArticlesByCategory(articles, query) {
  const normalizedQuery = typeof query === "string" ? query.trim().toLowerCase() : "";

  if (!normalizedQuery) {
    return articles;
  }

  return articles.filter((article) => article.category.toLowerCase().includes(normalizedQuery));
}
