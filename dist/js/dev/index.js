import { d as dataMediaQueries, b as slideUp, s as slideDown } from "./app.min.js";
import "./slider.min.js";
function showMore() {
  const showMoreBlocks = document.querySelectorAll("[data-showmore]");
  let showMoreBlocksRegular;
  let mdQueriesArray;
  if (showMoreBlocks.length) {
    showMoreBlocksRegular = Array.from(showMoreBlocks).filter(function(item, index, self) {
      return !item.dataset.FLSShowmoreMedia;
    });
    showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
    document.addEventListener("click", showMoreActions);
    window.addEventListener("resize", showMoreActions);
    mdQueriesArray = dataMediaQueries(showMoreBlocks, "FLSShowmoreMedia");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
      });
      initItemsMedia(mdQueriesArray);
    }
  }
  function initItemsMedia(mdQueriesArray2) {
    mdQueriesArray2.forEach((mdQueriesItem) => {
      initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
    });
  }
  function initItems(showMoreBlocks2, matchMedia) {
    showMoreBlocks2.forEach((showMoreBlock) => {
      initItem(showMoreBlock, matchMedia);
    });
  }
  function initItem(showMoreBlock, matchMedia = false) {
    showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock;
    let showMoreContent = showMoreBlock.querySelectorAll("[data-showmore-content]");
    let showMoreButton = showMoreBlock.querySelectorAll("[data-showmore-button]");
    showMoreContent = Array.from(showMoreContent).filter((item) => item.closest("[data-showmore]") === showMoreBlock)[0];
    showMoreButton = Array.from(showMoreButton).filter((item) => item.closest("[data-showmore]") === showMoreBlock)[0];
    const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
    if (matchMedia.matches || !matchMedia) {
      if (hiddenHeight < getOriginalHeight(showMoreContent)) {
        slideUp(showMoreContent, 0, showMoreBlock.classList.contains("--showmore-active") ? getOriginalHeight(showMoreContent) : hiddenHeight);
        showMoreButton.hidden = false;
      } else {
        slideDown(showMoreContent, 0, hiddenHeight);
        showMoreButton.hidden = true;
      }
    } else {
      slideDown(showMoreContent, 0, hiddenHeight);
      showMoreButton.hidden = true;
    }
  }
  function getHeight(showMoreBlock, showMoreContent) {
    let hiddenHeight = 0;
    const showMoreType = showMoreBlock.dataset.FLSShowmore ? showMoreBlock.dataset.FLSShowmore : "size";
    const rowGap = parseFloat(getComputedStyle(showMoreContent).rowGap) ? parseFloat(getComputedStyle(showMoreContent).rowGap) : 0;
    if (showMoreType === "items") {
      const showMoreTypeValue = showMoreContent.dataset.FLSShowmoreContent ? showMoreContent.dataset.FLSShowmoreContent : 3;
      const showMoreItems = showMoreContent.children;
      for (let index = 1; index < showMoreItems.length; index++) {
        const showMoreItem = showMoreItems[index - 1];
        const marginTop = parseFloat(getComputedStyle(showMoreItem).marginTop) ? parseFloat(getComputedStyle(showMoreItem).marginTop) : 0;
        const marginBottom = parseFloat(getComputedStyle(showMoreItem).marginBottom) ? parseFloat(getComputedStyle(showMoreItem).marginBottom) : 0;
        hiddenHeight += showMoreItem.offsetHeight + marginTop;
        if (index == showMoreTypeValue) break;
        hiddenHeight += marginBottom;
      }
      rowGap ? hiddenHeight += (showMoreTypeValue - 1) * rowGap : null;
    } else {
      const showMoreTypeValue = showMoreContent.dataset.FLSShowmoreContent ? showMoreContent.dataset.FLSShowmoreContent : 150;
      hiddenHeight = showMoreTypeValue;
    }
    return hiddenHeight;
  }
  function getOriginalHeight(showMoreContent) {
    let parentHidden;
    let hiddenHeight = showMoreContent.offsetHeight;
    showMoreContent.style.removeProperty("height");
    if (showMoreContent.closest(`[hidden]`)) {
      parentHidden = showMoreContent.closest(`[hidden]`);
      parentHidden.hidden = false;
    }
    let originalHeight = showMoreContent.offsetHeight;
    parentHidden ? parentHidden.hidden = true : null;
    showMoreContent.style.height = `${hiddenHeight}px`;
    return originalHeight;
  }
  function showMoreActions(e) {
    const targetEvent = e.target;
    const targetType = e.type;
    if (targetType === "click") {
      if (targetEvent.closest("[data-showmore-button]")) {
        const showMoreButton = targetEvent.closest("[data-showmore-button]");
        const showMoreBlock = showMoreButton.closest("[data-showmore]");
        const showMoreContent = showMoreBlock.querySelector("[data-showmore-content]");
        const showMoreSpeed = showMoreBlock.dataset.FLSShowmoreButton ? showMoreBlock.dataset.FLSShowmoreButton : "500";
        const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
        if (!showMoreContent.classList.contains("--slide")) {
          showMoreBlock.classList.contains("--showmore-active") ? slideUp(showMoreContent, showMoreSpeed, hiddenHeight) : slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
          showMoreBlock.classList.toggle("--showmore-active");
        }
      }
    } else if (targetType === "resize") {
      showMoreBlocksRegular && showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
      mdQueriesArray && mdQueriesArray.length ? initItemsMedia(mdQueriesArray) : null;
    }
  }
}
window.addEventListener("load", showMore);
class CustomDropdown {
  constructor(element) {
    if (!element) {
      console.error("Dropdown элемент не найден");
      return;
    }
    this.dropdown = element;
    this.toggle = element.querySelector("[data-dropdown-toggle]");
    this.menu = element.querySelector("[data-dropdown-menu]");
    if (!this.toggle || !this.menu) {
      console.error("Не все элементы dropdown найдены", element);
      return;
    }
    this.items = Array.from(this.menu.children).filter((child) => child.hasAttribute("data-value"));
    if (this.items.length === 0) {
      console.error("В меню dropdown нет элементов с data-value", element);
      return;
    }
    this.isOpen = false;
    this.selectedValue = null;
    this.placeholderText = this.toggle.textContent.trim();
    this.init();
  }
  init() {
    this.toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
    this.items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectItem(item);
      });
    });
    document.addEventListener("click", (e) => {
      if (!this.dropdown.contains(e.target)) {
        this.close();
      }
    });
    this.dropdown.addEventListener("dropdown:opening", () => {
      document.querySelectorAll("[data-dropdown]").forEach((dd) => {
        if (dd !== this.dropdown) {
          const instance = dd._dropdownInstance;
          if (instance && instance.isOpen) {
            instance.close();
          }
        }
      });
    });
    this.dropdown._dropdownInstance = this;
  }
  toggleMenu() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  open() {
    this.dropdown.dispatchEvent(new Event("dropdown:opening"));
    this.isOpen = true;
    this.toggle.classList.add("active");
    this.menu.classList.add("show");
  }
  close() {
    this.isOpen = false;
    this.toggle.classList.remove("active");
    this.menu.classList.remove("show");
  }
  selectItem(item) {
    if (!item) return;
    this.items.forEach((i) => i.classList.remove("selected"));
    item.classList.add("selected");
    this.selectedValue = item.dataset.value;
    const itemText = item.textContent.trim();
    const textElement = this.toggle.querySelector(".dropdown-text");
    if (textElement) {
      textElement.textContent = itemText;
    } else {
      const textNode = Array.from(this.toggle.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = itemText;
      } else {
        this.toggle.insertBefore(document.createTextNode(itemText), this.toggle.firstChild);
      }
    }
    this.close();
    this.dropdown.dispatchEvent(new CustomEvent("dropdown:change", {
      detail: {
        value: this.selectedValue,
        text: itemText,
        dropdown: this.dropdown
      }
    }));
  }
  getValue() {
    return this.selectedValue;
  }
  getText() {
    return this.toggle.textContent.trim();
  }
  reset() {
    this.items.forEach((i) => i.classList.remove("selected"));
    const textElement = this.toggle.querySelector(".dropdown-text");
    if (textElement) {
      textElement.textContent = this.placeholderText;
    } else {
      const textNode = Array.from(this.toggle.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) {
        textNode.textContent = this.placeholderText;
      }
    }
    this.selectedValue = null;
  }
}
function initDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  if (dropdowns.length === 0) {
    console.warn("Dropdown элементы не найдены на странице");
    return;
  }
  dropdowns.forEach((dropdown) => {
    new CustomDropdown(dropdown);
  });
  console.log(`Инициализировано ${dropdowns.length} dropdown(ов)`);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDropdowns);
} else {
  initDropdowns();
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll("[data-dropdown]").forEach((dd) => {
      const instance = dd._dropdownInstance;
      if (instance && instance.isOpen) {
        instance.close();
      }
    });
  }
});
document.addEventListener("dropdown:change", (e) => {
  console.log("Изменение dropdown:", e.detail);
  const allValues = [];
  document.querySelectorAll("[data-dropdown]").forEach((dd) => {
    const instance = dd._dropdownInstance;
    if (instance && instance.getValue()) {
      allValues.push(`${instance.getText()}: ${instance.getValue()}`);
    }
  });
  document.getElementById("result").textContent = allValues.length > 0 ? allValues.join(" | ") : "Ничего не выбрано";
});
