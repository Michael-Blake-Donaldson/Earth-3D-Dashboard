// Fetch the query parameter from the URL
const params = new URLSearchParams(window.location.search);
const articleTitle = params.get("title");

// Fetch the container to display the article
const articleContainer = document.getElementById("article-container");

// Find the matching article
const article = articles.find((art) => art.title === articleTitle);

if (article) {
  // Render the article
  articleContainer.innerHTML = `
    <div class="article">
      <img src="assets/articleImages/${article.image}" alt="${article.title}">
      <div class="article-content">
        <h2>${article.title}</h2>
        <p><strong>Category:</strong> ${article.category}</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat, metus id scelerisque 
        fermentum, arcu erat facilisis nulla, a tincidunt enim magna ut ligula. [Add full content here]</p>
      </div>
    </div>
  `;
} else {
  // If no article is found
  articleContainer.innerHTML = "<p>Article not found!</p>";
}
