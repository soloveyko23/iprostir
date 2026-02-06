import "./app.min.js";
import "./tabs.min.js";
import "./slider.min.js";
import "./rating.min.js";
function formQuantity() {
  document.addEventListener("click", quantityActions);
  document.addEventListener("keyup", quantityActions);
  function quantityActions(e) {
    const type = e.type;
    const target = e.target;
    if (type === "click") {
      if (target.closest("[data-quantity-plus]") || target.closest("[data-quantity-minus]")) {
        const wrap = target.closest("[data-quantity]");
        const input = wrap.querySelector("[data-quantity-value]");
        let value = parseFloat(input.value.replace(",", "."));
        let step = getStep(value);
        if (target.hasAttribute("data-quantity-plus")) {
          value = normalize(value + step);
          if (+input.dataset.FLSQuantityFLS && value > +input.dataset.FLSQuantityFLS) {
            value = +input.dataset.FLSQuantityFLS;
          }
        } else {
          value = normalize(value - step);
          if (+input.dataset.FLSQuantityMin) {
            if (value < +input.dataset.FLSQuantityMin) value = +input.dataset.FLSQuantityMin;
          } else if (value < 0.5) {
            value = 0.5;
          }
        }
        input.value = format(value);
      }
    } else if (type === "keyup") {
      if (target.closest("[data-quantity-value]")) {
        const input = target.closest("[data-quantity-value]");
        let value = parseFloat(input.value.replace(",", "."));
        if (isNaN(value) || value <= 0) value = 0.5;
        input.value = format(value);
      }
    }
  }
  function getStep(value) {
    if (value === 0.5) return 0.5;
    if (value < 1) return 1 - value;
    return 1;
  }
  function normalize(v) {
    return Math.round(v * 10) / 10;
  }
  function format(v) {
    return ("" + v).replace(".", ",");
  }
}
window.addEventListener("load", formQuantity);
