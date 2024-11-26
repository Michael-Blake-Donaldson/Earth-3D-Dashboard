const articles = [
    {
      category: "Climate",
      title: "The Effects of Climate Change",
      excerpt: "Discover how climate change is affecting our planet and what we can do to combat it.",
      image: "climatechangeEARTH.jpg",
      content: `Climate change has become one of the most pressing global challenges of the 21st century. It refers to significant and long-term changes in global temperature and weather patterns. While natural cycles have historically contributed to these changes, human activities—such as burning fossil fuels, deforestation, and industrial emissions—have drastically accelerated the pace. The result is a warmer planet with increasingly unpredictable weather.
            The effects of climate change are far-reaching. Rising sea levels caused by melting polar ice caps threaten coastal cities and island nations. Extreme weather events, including hurricanes, droughts, and floods, are becoming more frequent and severe. These changes disrupt ecosystems, endanger wildlife, and pose risks to human health and safety.
            Agriculture and food security are particularly vulnerable. Warmer temperatures and changing rainfall patterns can reduce crop yields and exacerbate food shortages in already struggling regions. At the same time, ocean acidification caused by higher carbon dioxide levels endangers marine life, particularly coral reefs and shellfish.
            The economic impact of climate change is significant. Infrastructure damage from natural disasters, the cost of adapting to changing conditions, and the health burden from heatwaves and vector-borne diseases all strain national and global economies. In response, many countries are committing to renewable energy transitions and policies to reduce carbon emissions.
            Individuals also have a role to play. Simple actions like reducing energy consumption, recycling, and supporting sustainable practices can collectively make a difference. Advocacy and education are critical in pushing governments and corporations toward meaningful climate action.
            **Further Reading:**
            1. [NASA Climate Change](https://climate.nasa.gov/)
            2. [UN Climate Action](https://www.un.org/en/climatechange)
            3. [National Geographic: Climate Change](https://www.nationalgeographic.com/environment/climate-change)
        `,
    },
    {
      category: "Geology",
      title: "The Formation of Mountains",
      excerpt: "Learn about the incredible geological forces that create mountains over millions of years.",
      image: "GeologyEARTH.jpg",
      content: "Mountains are among Earth's most majestic and enduring features. They are formed over millions of years through the movement of tectonic plates. When two plates collide, they push layers of the Earth's crust upwards, creating towering peaks. The Himalayas, for instance, were formed by the collision of the Indian and Eurasian plates. Erosion plays a critical role in shaping mountains over time. Water, wind, and ice wear down the peaks and sculpt valleys and ridges, giving mountains their unique and dramatic features. Glaciers carve through rock, leaving behind stunning landscapes like the fjords of Norway or the U-shaped valleys of the Alps. Volcanic activity is another way mountains form. Volcanic mountains like Mount Fuji in Japan are created when magma from the Earth's mantle erupts to the surface. These types of mountains often have distinct conical shapes and can remain active for centuries. Mountains are not just geological wonders—they are also biodiversity hotspots. Their varying altitudes and climates create unique ecosystems that support a wide range of plant and animal species. However, these ecosystems are fragile and increasingly threatened by climate change and human activity. For humans, mountains are both a resource and a challenge. They provide fresh water, minerals, and recreation opportunities but also pose risks like landslides and avalanches. As we explore and inhabit these areas, it is vital to balance development with conservation. Further Reading: 1. [USGS: Mountains](https://www.usgs.gov/) 2. [National Geographic: Geology of Mountains](https://www.nationalgeographic.org/education/) 3. [Geology.com: Mountain Formation](https://geology.com/)"
    },
    {
      category: "Oceanography",
      title: "The Mysteries of the Deep Sea",
      excerpt: "Explore the hidden world beneath the ocean's surface, teeming with life.",
      image: "OceanographyEARTH.jpg",
      content: "The deep sea, which begins at depths of 200 meters, is one of Earth's least explored regions. Despite covering over 60% of the planet's surface, much of it remains a mystery. The deep ocean is characterized by complete darkness, crushing pressures, and near-freezing temperatures, yet it teems with life. Deep-sea ecosystems are incredibly diverse, ranging from hydrothermal vents to cold seeps. Hydrothermal vents, in particular, are fascinating environments where mineral-rich water supports unique organisms, such as giant tube worms and methane-eating bacteria. These ecosystems thrive in conditions once thought to be inhospitable to life. Exploration of the deep sea has revealed species adapted to extreme environments. Many deep-sea creatures have bioluminescence, using light to attract prey or evade predators. Some, like the anglerfish, are equipped with specialized adaptations to survive in the sparse environment. The deep ocean also holds clues to Earth's history and future. Sediments on the ocean floor contain records of past climate conditions, while deep-sea mining for minerals raises questions about sustainable resource use. These unexplored depths might also harbor compounds with medicinal properties. Despite its importance, the deep sea faces significant threats, including pollution, overfishing, and climate change. Plastic waste and microplastics have been found in some of the planet's most remote underwater areas, highlighting the urgent need for global action. Further Reading: 1. [NOAA Deep Sea Exploration](https://oceanexplorer.noaa.gov/) 2. [Oceanographic Institute](https://www.whoi.edu/) 3. [BBC Earth: Deep Sea](https://www.bbcearth.com/)"
    },
    {
        category: "Astronomy",
        title: "Earth's Place in the Universe",
        excerpt: "Uncover the story of Earth's origins and its position in the vast cosmos.",
        image: "spacelaunchEARTH.jpg",
        content: "Earth is a small but significant part of a vast and expanding universe. Positioned in the habitable zone of our solar system, Earth benefits from the right conditions for liquid water, a stable atmosphere, and a magnetic field that protects it from harmful solar radiation. These factors make it uniquely suited for life. The story of Earth's origins is tied to the formation of the solar system 4.6 billion years ago. Dust and gas coalesced under gravity to form the Sun and surrounding planets. Earth, as the third planet from the Sun, became a haven for diverse ecosystems due to its distance from the Sun and the presence of water. Astronomical phenomena like eclipses, meteor showers, and planetary alignments remind us of Earth's place in the cosmos. Observing these events has inspired curiosity and scientific advancement for centuries. From early astronomers like Copernicus to modern space telescopes like the James Webb, the quest to understand Earth's relationship with the universe continues. Space exploration has broadened our perspective on Earth. Viewing the planet from space underscores its fragility and interconnected systems. Satellites monitor Earth's climate, track deforestation, and study the movement of tectonic plates, providing critical data for sustainability efforts. As technology advances, the search for Earth-like exoplanets in other star systems raises profound questions about the possibility of life beyond our planet. While Earth remains our home, the universe beckons us to explore and learn. Further Reading: 1. [NASA Solar System Exploration](https://solarsystem.nasa.gov/) 2. [European Space Agency](https://www.esa.int/) 3. [Astronomy Magazine](https://www.astronomy.com/)"
    },
    {
        category: "Ecology",
        title: "The Role of Forests in Earth's Ecosystem",
        excerpt: "Dive into the critical role forests play in maintaining the planet's ecological balance.",
        image: "ForestsEARTH.jpg",
        content: "Forests are often referred to as the lungs of the Earth due to their vital role in producing oxygen and absorbing carbon dioxide. Covering about 31% of the planet's land area, forests are home to an incredible diversity of life, from towering trees to microscopic organisms. They provide essential ecosystem services that are crucial for life on Earth. One of the most important functions of forests is their role in regulating the global climate. By absorbing large amounts of carbon dioxide, forests act as natural carbon sinks, mitigating the effects of climate change. They also influence weather patterns and maintain the water cycle by storing and releasing water vapor into the atmosphere. Forests are a biodiversity hotspot, hosting more than 80% of the terrestrial species of animals, plants, and fungi. From tropical rainforests like the Amazon to boreal forests in Canada, these habitats are critical for the survival of countless species. However, deforestation poses a significant threat to this rich biodiversity. Beyond their ecological importance, forests provide resources such as timber, fruits, and medicinal plants, which support millions of livelihoods worldwide. Indigenous communities often rely on forests for their cultural, spiritual, and economic well-being. Protecting these ecosystems is essential for their survival and ours. Conservation efforts are underway to preserve forests, but challenges like illegal logging, agricultural expansion, and urbanization persist. Reforestation and sustainable management practices are crucial for ensuring forests remain a vital part of Earth's ecosystem. Further Reading: 1. [WWF: Forests](https://www.worldwildlife.org/initiatives/forests) 2. [National Geographic: Forest Conservation](https://www.nationalgeographic.org/) 3. [FAO: Global Forest Resources](http://www.fao.org/forest-resources-assessment/en/)"
    },
    {
        category: "Geology",
        title: "Volcanoes: Earth's Fiery Giants",
        excerpt: "Explore the science behind volcanoes and their impact on our planet.",
        image: "VolcanoesEARTH.jpg",
        content: "Volcanoes are one of Earth's most awe-inspiring natural phenomena. They are openings in the Earth's crust through which molten rock, ash, and gases erupt. These fiery giants are found at tectonic plate boundaries, such as the Pacific Ring of Fire, and hotspots like Hawaii. Understanding how they work offers insights into Earth's inner workings. Volcanoes form when magma from the Earth's mantle rises to the surface. This occurs due to the movement of tectonic plates, which creates cracks and weak spots in the crust. When pressure builds up, a volcanic eruption occurs, releasing lava, ash, and gases into the atmosphere. The scale of these eruptions can range from small lava flows to catastrophic explosions. Despite their destructive power, volcanoes play a vital role in shaping Earth's landscape. They create new landmasses, such as islands, and enrich the soil with nutrients, making it fertile for agriculture. Volcanic activity has also influenced the planet's climate and evolution, contributing to mass extinctions and periods of global cooling. Living near a volcano comes with risks, including lava flows, ashfall, and pyroclastic flows. However, many communities thrive in volcanic regions due to the rich soil and geothermal energy. Advances in monitoring technology have improved our ability to predict eruptions and reduce their impact on human life. Scientists continue to study volcanoes to understand their behavior and mitigate their dangers. By learning more about these fiery giants, we can better prepare for their potential impact and harness their benefits. Further Reading: 1. [USGS Volcano Hazards Program](https://volcanoes.usgs.gov/) 2. [Smithsonian Global Volcanism Program](https://volcano.si.edu/) 3. [National Geographic: Volcanoes](https://www.nationalgeographic.com/environment/article/volcanoes)"
    },
    {
        category: "Oceanography",
        title: "Coral Reefs: The Rainforests of the Sea",
        excerpt: "Learn about the vibrant ecosystems of coral reefs and their importance to marine life.",
        image: "CoralReefsEARTH.jpg",
        content: "Coral reefs are often called the rainforests of the sea due to their incredible biodiversity. These underwater ecosystems are formed by colonies of coral polyps, tiny animals that secrete calcium carbonate to build protective structures. Found in tropical and subtropical waters, coral reefs cover less than 1% of the ocean floor but support 25% of marine species. Coral reefs provide a range of ecological services. They act as natural barriers, protecting coastlines from erosion and storm surges. Reefs also serve as breeding and feeding grounds for numerous marine species, contributing to the ocean's food web. Many of the fish and seafood consumed globally depend on reefs at some stage of their life cycle. Beyond their ecological importance, coral reefs hold economic and cultural significance. They attract millions of tourists each year, supporting local economies and creating jobs in the tourism and fishing industries. Additionally, reef ecosystems are a source of medicinal compounds, some of which are used in cancer and HIV treatments. However, coral reefs face significant threats, including climate change, overfishing, and pollution. Rising ocean temperatures cause coral bleaching, where corals expel the algae that give them color and nutrients. Without these algae, corals can die, leading to the collapse of the reef ecosystem. Efforts to protect coral reefs include marine protected areas, sustainable fishing practices, and reef restoration projects. By addressing these challenges, we can preserve these vibrant ecosystems for future generations. Further Reading: 1. [NOAA Coral Reef Conservation](https://coralreef.noaa.gov/) 2. [WWF: Coral Reefs](https://www.worldwildlife.org/) 3. [Coral Restoration Foundation](https://www.coralrestoration.org/)"
    },
    {
        category: "Astronomy",
        title: "The Earth's Magnetic Field",
        excerpt: "Discover the science behind Earth's magnetic field and its role in protecting the planet.",
        image: "magneticEARTH.jpg",
        content: "Earth's magnetic field is an invisible force that protects the planet from harmful solar radiation and charged particles. Generated by the movement of molten iron in the Earth's outer core, the magnetic field extends into space, forming the magnetosphere. This shield is essential for maintaining life on Earth. The magnetic field plays a crucial role in guiding navigation. Compasses have been used for centuries to help sailors, explorers, and travelers determine direction. Even animals like birds, turtles, and insects rely on the magnetic field for migration and orientation. Solar storms and space weather can disrupt the magnetic field, causing phenomena like auroras. These spectacular light displays occur when charged particles from the Sun interact with the Earth's magnetic field, creating colorful patterns in the polar skies. However, these events can also interfere with satellites, power grids, and communication systems. Scientists have observed that the magnetic field is not constant. Over geological timescales, it weakens, strengthens, and even reverses its polarity. These changes are recorded in rocks, providing insights into Earth's history and the behavior of its core. Research into the magnetic field continues to uncover its mysteries. Understanding its dynamics can help us predict geomagnetic events and protect vital infrastructure. As technology advances, studying Earth's magnetic field remains a priority for both science and society. Further Reading: 1. [NASA: Earth's Magnetosphere](https://www.nasa.gov/) 2. [NOAA Space Weather Prediction](https://www.swpc.noaa.gov/) 3. [ESA Space Environment](https://www.esa.int/)"
    },
    {
        category: "Environmental Science",
        title: "The Science of Renewable Energy",
        excerpt: "Explore the technologies and innovations driving the shift to renewable energy sources.",
        image: "renewableenergyEARTH.jpg",
        content: "Renewable energy is at the forefront of efforts to combat climate change and reduce reliance on fossil fuels. Derived from natural sources like sunlight, wind, water, and geothermal heat, renewable energy offers a sustainable and clean alternative to traditional energy production methods. Solar power is one of the most widely adopted renewable energy sources. Photovoltaic panels capture sunlight and convert it into electricity, making it a versatile and scalable solution. Wind energy harnesses the power of moving air to turn turbines, generating electricity for homes, businesses, and industries. Hydropower, the oldest form of renewable energy, uses the flow of water to produce electricity. Geothermal energy taps into the Earth's internal heat, providing a reliable source of power and heating. Advances in technology have made these energy sources more efficient and accessible, driving global adoption. Transitioning to renewable energy has significant environmental and economic benefits. It reduces greenhouse gas emissions, improves air quality, and creates jobs in the green energy sector. However, challenges remain, including the intermittent nature of some renewable sources and the need for better energy storage solutions. Governments and organizations worldwide are investing in research and infrastructure to overcome these obstacles. Initiatives like net-zero carbon goals and international agreements are accelerating the shift to renewables, paving the way for a sustainable future. Further Reading: 1. [IRENA: Renewable Energy](https://www.irena.org/) 2. [DOE: Renewable Energy](https://www.energy.gov/) 3. [UN Sustainable Energy](https://www.un.org/sustainabledevelopment/energy/)"
    },
  ];
  
  document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById("articles");
    const searchInput = document.getElementById("search-input");

    if (!articlesContainer) {
        console.error('Element with id "articles" not found!');
        return;
    }

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
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            renderArticles(e.target.value);
        });
    }
});
  
  