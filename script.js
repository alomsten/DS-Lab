const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const searchBox = document.querySelector(".search-box");
const searchInput = document.querySelector("#site-search");
const searchMenu = document.querySelector(".search-menu");
const searchItems = Array.from(document.querySelectorAll(".search-menu a"));
const publicationFilter = document.querySelector("#publication-filter");
const publicationEntries = Array.from(document.querySelectorAll(".pub-entry"));
const publicationGroups = Array.from(document.querySelectorAll("[data-year-group]"));
const emptyState = document.querySelector(".empty-state");

function openSearch() {
  if (!searchMenu) return;
  searchMenu.hidden = false;
  searchBox?.classList.add("is-open");
}

function closeSearch() {
  if (!searchMenu) return;
  searchMenu.hidden = true;
  searchBox?.classList.remove("is-open");
}

function filterSearchItems() {
  const query = searchInput?.value.trim().toLowerCase() ?? "";

  searchItems.forEach((item) => {
    const label = item.textContent?.toLowerCase() ?? "";
    item.hidden = Boolean(query) && !label.includes(query);
  });
}

menuButton?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open") ?? false;
  menuButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    searchBox?.classList.add("is-open");
  } else {
    searchBox?.classList.remove("is-open");
    closeSearch();
  }
});

searchInput?.addEventListener("focus", () => {
  openSearch();
  filterSearchItems();
});

searchInput?.addEventListener("click", () => {
  openSearch();
});

searchInput?.addEventListener("input", filterSearchItems);

searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSearch();
    searchInput.blur();
  }
});

searchBox?.addEventListener("submit", (event) => {
  event.preventDefault();
  const firstVisibleItem = searchItems.find((item) => !item.hidden);
  if (firstVisibleItem) {
    window.location.href = firstVisibleItem.href;
  }
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof Node && searchBox?.contains(target)) {
    return;
  }
  closeSearch();
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTitle(titleElement, query) {
  const originalTitle = titleElement.dataset.originalTitle ?? titleElement.textContent ?? "";
  titleElement.dataset.originalTitle = originalTitle;

  if (!query) {
    titleElement.textContent = originalTitle;
    return;
  }

  const pattern = new RegExp(`(${escapeRegExp(query)})`, "ig");
  titleElement.innerHTML = escapeHtml(originalTitle).replace(pattern, "<mark>$1</mark>");
}

function filterPublications() {
  const query = publicationFilter?.value.trim().toLowerCase() ?? "";
  let visibleCount = 0;

  publicationEntries.forEach((entry) => {
    const titleElement = entry.querySelector(".pub-title");
    const title = titleElement?.dataset.originalTitle ?? titleElement?.textContent ?? "";
    const searchableText = [
      title,
      entry.dataset.search ?? "",
      entry.querySelector(".pub-authors")?.textContent ?? "",
      entry.querySelector(".pub-venue")?.textContent ?? "",
    ].join(" ");
    const isMatch = !query || searchableText.toLowerCase().includes(query);

    entry.hidden = !isMatch;
    if (titleElement) {
      highlightTitle(titleElement, isMatch ? query : "");
    }
    if (isMatch) {
      visibleCount += 1;
    }
  });

  publicationGroups.forEach((group) => {
    const hasVisibleEntry = Boolean(group.querySelector(".pub-entry:not([hidden])"));
    group.hidden = !hasVisibleEntry;
  });

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
  }
}

publicationFilter?.addEventListener("input", filterPublications);
