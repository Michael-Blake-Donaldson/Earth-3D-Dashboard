import { describe, expect, it } from "vitest";
import { filterArticlesByCategory } from "../src/utils/articles.js";

const sampleArticles = [
  { category: "Climate", title: "A" },
  { category: "Geology", title: "B" },
  { category: "Oceanography", title: "C" },
];

describe("filterArticlesByCategory", () => {
  it("returns all articles when query is empty", () => {
    expect(filterArticlesByCategory(sampleArticles, "")).toHaveLength(3);
  });

  it("filters by category with case-insensitive matching", () => {
    const result = filterArticlesByCategory(sampleArticles, "geo");
    expect(result).toEqual([{ category: "Geology", title: "B" }]);
  });

  it("returns no results for non-matching filters", () => {
    expect(filterArticlesByCategory(sampleArticles, "astronomy")).toHaveLength(0);
  });
});
