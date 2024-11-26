const articles = [
    {
      category: "Climate",
      title: "The Effects of Climate Change",
      excerpt: "Discover how climate change is affecting our planet and what we can do to combat it.",
      image: "climatechangeEARTH.jpg",
    },
    {
      category: "Geology",
      title: "The Formation of Mountains",
      excerpt: "Learn about the incredible geological forces that create mountains over millions of years.",
      image: "GeologyEARTH.jpg",
    },
    {
      category: "Oceanography",
      title: "The Mysteries of the Deep Sea",
      excerpt: "Explore the hidden world beneath the ocean's surface, teeming with life.",
      image: "OceanographyEARTH.jpg",
    },
    {
        category: "Astronomy",
        title: "Earth's Place in the Universe",
        excerpt: "Uncover the story of Earth's origins and its position in the vast cosmos.",
        image: "spacelaunchEARTH.jpg",
    },
    {
        category: "Ecology",
        title: "The Role of Forests in Earth's Ecosystem",
        excerpt: "Dive into the critical role forests play in maintaining the planet's ecological balance.",
        image: "ForestsEARTH.jpg",
    },
    {
        category: "Geology",
        title: "Volcanoes: Earth's Fiery Giants",
        excerpt: "Explore the science behind volcanoes and their impact on our planet.",
        image: "VolcanoesEARTH.jpg",
    },
    {
        category: "Oceanography",
        title: "Coral Reefs: The Rainforests of the Sea",
        excerpt: "Learn about the vibrant ecosystems of coral reefs and their importance to marine life.",
        image: "CoralReefsEARTH.jpg",
    },
    {
        category: "Astronomy",
        title: "The Earth's Magnetic Field",
        excerpt: "Discover the science behind Earth's magnetic field and its role in protecting the planet.",
        image: "magneticEARTH.jpg",
    },
    {
        category: "Environmental Science",
        title: "The Science of Renewable Energy",
        excerpt: "Explore the technologies and innovations driving the shift to renewable energy sources.",
        image: "renewableenergyEARTH.jpg",
    },
  ];
  
  const articlesContainer = document.getElementById("articles");
  const searchInput = document.getElementById("search-input");
  
  const renderArticles = (filter = "") => {
    articlesContainer.innerHTML = ""; // Clear the container
    const filteredArticles = articles.filter((article) =>
      article.category.toLowerCase().includes(filter.toLowerCase())
    );
    filteredArticles.forEach((article) => {
      const articleElement = document.createElement("div");
      articleElement.classList.add("article");
      articleElement.innerHTML = `
        <a href="article.html?title=${encodeURIComponent(article.title)}" class="article-link">
          <img src="assets/articleImages/${article.image}" alt="${article.title}">
          <div class="article-content">
            <div class="article-category">${article.category}</div>
            <div class="article-title">${article.title}</div>
            <div class="article-excerpt">${article.excerpt}</div>
          </div>
        </a>
      `;
      articlesContainer.appendChild(articleElement);
    });
  };
  
  // Initialize articles
  renderArticles();
  
  // Filter articles on search input
  searchInput.addEventListener("input", (e) => {
    renderArticles(e.target.value);
  });
  