import "./app.min.js";
import "./slider.min.js";
import "./rating.min.js";
function syncCompareRowHeights() {
  const table = document.querySelector(".compare-table");
  if (!table) return;
  const labelsContainer = table.querySelector(".compare-table__labels");
  const labels = table.querySelectorAll(".compare-table__label");
  const allItems = table.querySelectorAll(".compare-item");
  if (!labels.length || !allItems.length) return;
  labels.forEach((l) => l.style.minHeight = "");
  document.querySelectorAll(".compare-item__header, .compare-item__image, .compare-item__row, .compare-item__footer").forEach((el) => {
    el.style.minHeight = "";
  });
  if (labelsContainer && window.getComputedStyle(labelsContainer).display === "none") {
    return;
  }
  function getItemChildren(item) {
    const children = [];
    children.push(item.querySelector(".compare-item__header"));
    children.push(item.querySelector(".compare-item__image"));
    item.querySelectorAll(".compare-item__row").forEach((r) => children.push(r));
    children.push(item.querySelector(".compare-item__footer"));
    return children;
  }
  labels.forEach((label, index) => {
    let maxHeight = label.offsetHeight;
    allItems.forEach((item) => {
      const children = getItemChildren(item);
      if (children[index]) {
        maxHeight = Math.max(maxHeight, children[index].offsetHeight);
      }
    });
    label.style.minHeight = maxHeight + "px";
    allItems.forEach((item) => {
      const children = getItemChildren(item);
      if (children[index]) {
        children[index].style.minHeight = maxHeight + "px";
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  syncCompareRowHeights();
});
window.addEventListener("load", () => {
  syncCompareRowHeights();
});
window.addEventListener("resize", () => {
  syncCompareRowHeights();
});
