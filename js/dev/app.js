(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
function setHash(hash) {
  hash = hash ? `#${hash}` : window.location.href.split("#")[0];
  history.pushState("", "", hash);
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "FLS"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
class Popup {
  constructor(options) {
    let config = {
      logging: true,
      init: true,
      //Для кнопок
      attributeOpenButton: "data-popup-link",
      // Атрибут для кнопки, яка викликає попап
      attributeCloseButton: "data-popup-close",
      // Атрибут для кнопки, що закриває попап
      // Для сторонніх об'єктів
      fixElementSelector: "[data-lp]",
      // Атрибут для елементів із лівим паддингом (які fixed)
      // Для об'єкту попапа
      attributeMain: "data-popup",
      youtubeAttribute: "data-popup-youtube",
      // Атрибут для коду youtube
      youtubePlaceAttribute: "data-popup-youtube-place",
      // Атрибут для вставки ролика youtube
      setAutoplayYoutube: true,
      // Зміна класів
      classes: {
        popup: "popup",
        // popupWrapper: 'popup__wrapper',
        popupContent: "data-popup-body",
        popupActive: "data-popup-active",
        // Додається для попапа, коли він відкривається
        bodyActive: "data-popup-open"
        // Додається для боді, коли попап відкритий
      },
      focusCatch: true,
      // Фокус усередині попапа зациклений
      closeEsc: true,
      // Закриття ESC
      bodyLock: true,
      // Блокування скролла
      hashSettings: {
        location: true,
        // Хеш в адресному рядку
        goHash: true
        // Перехід по наявності в адресному рядку
      },
      on: {
        // Події
        beforeOpen: function() {
        },
        afterOpen: function() {
        },
        beforeClose: function() {
        },
        afterClose: function() {
        }
      }
    };
    this.youTubeCode;
    this.isOpen = false;
    this.targetOpen = {
      selector: false,
      element: false
    };
    this.previousOpen = {
      selector: false,
      element: false
    };
    this.lastClosed = {
      selector: false,
      element: false
    };
    this._dataValue = false;
    this.hash = false;
    this._reopen = false;
    this._selectorOpen = false;
    this.lastFocusEl = false;
    this._focusEl = [
      "a[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "button:not([disabled]):not([aria-hidden])",
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "area[href]",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"])'
    ];
    this.options = {
      ...config,
      ...options,
      classes: {
        ...config.classes,
        ...options?.classes
      },
      hashSettings: {
        ...config.hashSettings,
        ...options?.hashSettings
      },
      on: {
        ...config.on,
        ...options?.on
      }
    };
    this.bodyLock = false;
    this.options.init ? this.initPopups() : null;
  }
  initPopups() {
    this.buildPopup();
    this.eventsPopup();
  }
  buildPopup() {
  }
  eventsPopup() {
    document.addEventListener("click", (function(e) {
      const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
      if (buttonOpen) {
        e.preventDefault();
        this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
        this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
        if (this._dataValue !== "error") {
          if (!this.isOpen) this.lastFocusEl = buttonOpen;
          this.targetOpen.selector = `${this._dataValue}`;
          this._selectorOpen = true;
          this.open();
          return;
        }
        return;
      }
      const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
      if (buttonClose || !e.target.closest(`[${this.options.classes.popupContent}]`) && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
    }).bind(this));
    document.addEventListener("keydown", (function(e) {
      if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
        e.preventDefault();
        this.close();
        return;
      }
      if (this.options.focusCatch && e.which == 9 && this.isOpen) {
        this._focusCatch(e);
        return;
      }
    }).bind(this));
    if (this.options.hashSettings.goHash) {
      window.addEventListener("hashchange", (function() {
        if (window.location.hash) {
          this._openToHash();
        } else {
          this.close(this.targetOpen.selector);
        }
      }).bind(this));
      window.addEventListener("load", (function() {
        if (window.location.hash) {
          this._openToHash();
        }
      }).bind(this));
    }
  }
  open(selectorValue) {
    if (bodyLockStatus) {
      this.bodyLock = document.documentElement.hasAttribute("data-scrolllock") && !this.isOpen ? true : false;
      if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;
      this.targetOpen.element = document.querySelector(`[${this.options.attributeMain}=${this.targetOpen.selector}]`);
      if (this.targetOpen.element) {
        const codeVideo = this.youTubeCode || this.targetOpen.element.getAttribute(`${this.options.youtubeAttribute}`);
        if (codeVideo) {
          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
          const iframe = document.createElement("iframe");
          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
          iframe.setAttribute("src", urlVideo);
          if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
            this.targetOpen.element.querySelector("[data-popup-content]").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
          }
          this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          this._getHash();
          this._setHash();
        }
        this.options.on.beforeOpen(this);
        document.dispatchEvent(new CustomEvent("beforePopupOpen", {
          detail: {
            popup: this
          }
        }));
        this.targetOpen.element.setAttribute(this.options.classes.popupActive, "");
        document.documentElement.setAttribute(this.options.classes.bodyActive, "");
        if (!this._reopen) {
          !this.bodyLock ? bodyLock() : null;
        } else this._reopen = false;
        this.targetOpen.element.setAttribute("aria-hidden", "false");
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;
        this._selectorOpen = false;
        this.isOpen = true;
        setTimeout(() => {
          this._focusTrap();
        }, 50);
        this.options.on.afterOpen(this);
        document.dispatchEvent(new CustomEvent("afterPopupOpen", {
          detail: {
            popup: this
          }
        }));
      }
    }
  }
  close(selectorValue) {
    if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
      this.previousOpen.selector = selectorValue;
    }
    if (!this.isOpen || !bodyLockStatus) {
      return;
    }
    this.options.on.beforeClose(this);
    document.dispatchEvent(new CustomEvent("beforePopupClose", {
      detail: {
        popup: this
      }
    }));
    if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
      setTimeout(() => {
        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
      }, 500);
    }
    this.previousOpen.element.removeAttribute(this.options.classes.popupActive);
    this.previousOpen.element.setAttribute("aria-hidden", "true");
    if (!this._reopen) {
      document.documentElement.removeAttribute(this.options.classes.bodyActive);
      !this.bodyLock ? bodyUnlock() : null;
      this.isOpen = false;
    }
    this._removeHash();
    if (this._selectorOpen) {
      this.lastClosed.selector = this.previousOpen.selector;
      this.lastClosed.element = this.previousOpen.element;
    }
    this.options.on.afterClose(this);
    document.dispatchEvent(new CustomEvent("afterPopupClose", {
      detail: {
        popup: this
      }
    }));
    setTimeout(() => {
      this._focusTrap();
    }, 50);
  }
  // Отримання хешу 
  _getHash() {
    if (this.options.hashSettings.location) {
      this.hash = `#${this.targetOpen.selector}`;
    }
  }
  _openToHash() {
    let classInHash = window.location.hash.replace("#", "");
    const openButton = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`);
    if (openButton) {
      this.youTubeCode = openButton.getAttribute(this.options.youtubeAttribute) ? openButton.getAttribute(this.options.youtubeAttribute) : null;
    }
    if (classInHash) this.open(classInHash);
  }
  // Встановлення хеша
  _setHash() {
    history.pushState("", "", this.hash);
  }
  _removeHash() {
    history.pushState("", "", window.location.href.split("#")[0]);
  }
  _focusCatch(e) {
    const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
    const focusArray = Array.prototype.slice.call(focusable);
    const focusedIndex = focusArray.indexOf(document.activeElement);
    if (e.shiftKey && focusedIndex === 0) {
      focusArray[focusArray.length - 1].focus();
      e.preventDefault();
    }
    if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
      focusArray[0].focus();
      e.preventDefault();
    }
  }
  _focusTrap() {
    const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
    if (!this.isOpen && this.lastFocusEl) {
      this.lastFocusEl.focus();
    } else {
      focusable[0].focus();
    }
  }
}
class AuthPopup {
  constructor() {
    this.popup = document.querySelector('[data-popup="auth"]');
    if (!this.popup) return;
    this.tabs = this.popup.querySelectorAll("[data-tab]");
    this.switchLink = this.popup.querySelector("[data-switch-to]");
    this.forms = this.popup.querySelector(".auth-popup__forms");
    this.loginForm = this.popup.querySelector('[data-form="login"]');
    this.registerForm = this.popup.querySelector('[data-form="register"]');
    this.passwordToggles = this.popup.querySelectorAll("[data-password-toggle]");
    this.init();
  }
  init() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab));
    });
    if (this.switchLink) {
      this.switchLink.addEventListener("click", () => this.switchTab("register"));
    }
    this.passwordToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => this.togglePassword(e.target.closest("[data-password-toggle]")));
    });
    this.initFormValidation();
  }
  switchTab(tabName) {
    this.tabs.forEach((tab) => {
      tab.classList.toggle("auth-popup__tab--active", tab.dataset.tab === tabName);
    });
    if (tabName === "register") {
      this.forms.classList.add("--show-register");
      this.registerForm.style.display = "block";
      this.loginForm.style.display = "none";
    } else {
      this.forms.classList.remove("--show-register");
      this.loginForm.style.display = "block";
      this.registerForm.style.display = "none";
    }
  }
  togglePassword(button) {
    const input = button.parentElement.querySelector("input");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    const icon = button.querySelector("svg path:last-child");
    icon.style.display = isPassword ? "none" : "block";
  }
  initFormValidation() {
    const forms = [this.loginForm, this.registerForm];
    forms.forEach((form) => {
      if (!form) return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.validateForm(form);
      });
      const inputs = form.querySelectorAll("[data-input]");
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateInput(input));
        input.addEventListener("input", () => this.clearError(input));
      });
    });
  }
  validateForm(form) {
    const inputs = form.querySelectorAll("[data-input]");
    let isValid = true;
    inputs.forEach((input) => {
      if (!this.validateInput(input)) {
        isValid = false;
      }
    });
    if (isValid) {
      console.log("Form submitted:", new FormData(form));
    }
  }
  validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const name = input.name;
    let isValid = true;
    let errorMessage = "";
    this.clearError(input);
    if (!value) {
      errorMessage = input.dataset.error || "Поле обязательно для заполнения";
      isValid = false;
    } else if (type === "email" && !this.isValidEmail(value)) {
      errorMessage = "Укажите корректный адрес электронной почты";
      isValid = false;
    } else if (type === "password" && value.length < 6) {
      errorMessage = "Пароль должен содержать минимум 6 символов";
      isValid = false;
    } else if (name === "password_confirm") {
      const password = input.closest("form").querySelector('input[name="password"]');
      if (password && value !== password.value) {
        errorMessage = "Пароли не совпадают";
        isValid = false;
      }
    }
    if (!isValid) {
      this.showError(input, errorMessage);
    }
    return isValid;
  }
  clearError(input) {
    input.classList.remove("--form-error");
    const errorElement = input.parentElement.querySelector(".auth-form__error");
    if (errorElement) {
      errorElement.remove();
    }
  }
  showError(input, message) {
    input.classList.add("--form-error");
    const errorElement = document.createElement("div");
    errorElement.className = "auth-form__error";
    errorElement.textContent = message;
    input.parentElement.appendChild(errorElement);
  }
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
document.querySelector("[data-popup]") ? window.addEventListener("load", () => {
  window.FLSPopup = new Popup({});
  new AuthPopup();
}) : null;
function menuInit() {
  function closeMenu() {
    if (document.documentElement.hasAttribute("data-menu-open")) {
      bodyUnlock(0);
      document.documentElement.removeAttribute("data-menu-open");
    }
  }
  function openMenu() {
    if (!document.documentElement.hasAttribute("data-menu-open")) {
      bodyLock(0);
      document.documentElement.setAttribute("data-menu-open", "");
    }
  }
  document.addEventListener("click", function(e) {
    if (e.target.closest("[data-menu]")) {
      if (document.documentElement.hasAttribute("data-menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
      return;
    }
    if (document.documentElement.hasAttribute("data-menu-open")) {
      const isInsideMenu = e.target.closest(".menu__body");
      const isCatalogButton = e.target.closest(".catalog-menu__toggle");
      const isInsideCatalogMenu = e.target.closest(".catalog-menu");
      if (!isInsideMenu && !isCatalogButton && !isInsideCatalogMenu) {
        closeMenu();
      }
    }
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && document.documentElement.hasAttribute("data-menu-open")) {
      closeMenu();
    }
  });
}
document.querySelector("[data-menu]") ? window.addEventListener("load", menuInit) : null;
function initCart$1() {
  const cartContainer = document.querySelector("[data-cart]");
  const cartTrigger = document.querySelector("[data-cart-trigger]");
  const cartDropdown = document.querySelector("[data-cart-dropdown]");
  if (!cartContainer || !cartTrigger || !cartDropdown) return;
  const isMobile = () => window.matchMedia("(pointer: coarse)").matches;
  if (isMobile()) {
    cartTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      cartDropdown.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!cartContainer.contains(e.target)) {
        cartDropdown.classList.remove("active");
      }
    });
  } else {
    cartContainer.addEventListener("mouseenter", () => {
      cartDropdown.classList.add("active");
    });
    cartContainer.addEventListener("mouseleave", () => {
      cartDropdown.classList.remove("active");
    });
  }
}
function initCatalogButton$1() {
  const catalogButton = document.querySelector(".button-catalog");
  const headerSubcategories = document.querySelector(".header__subcategories");
  if (!catalogButton) return;
  const isHomePage = document.querySelector(".page--home") !== null;
  const isMobile = () => window.innerWidth <= 991;
  let closeTimer = null;
  function updateOverlayPosition() {
    if (!headerSubcategories) return;
    const headerBottom = document.querySelector(".header__bottom");
    if (headerBottom) {
      const rect = headerBottom.getBoundingClientRect();
      headerSubcategories.style.top = rect.bottom + "px";
    }
  }
  function openCatalog() {
    if (!headerSubcategories) return;
    cancelCloseTimer();
    updateOverlayPosition();
    headerSubcategories.classList.add("active");
    document.body.classList.add("catalog-open");
    document.dispatchEvent(new CustomEvent("catalog:open"));
  }
  function closeCatalog() {
    if (!headerSubcategories) return;
    headerSubcategories.classList.remove("active");
    document.body.classList.remove("catalog-open");
    document.dispatchEvent(new CustomEvent("catalog:close"));
  }
  function startCloseTimer() {
    cancelCloseTimer();
    closeTimer = setTimeout(() => {
      closeCatalog();
    }, 600);
  }
  function cancelCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }
  if (!isMobile()) {
    catalogButton.addEventListener("mouseenter", () => {
      if (isHomePage) return;
      openCatalog();
    });
    catalogButton.addEventListener("mouseleave", () => {
      if (isHomePage) return;
      startCloseTimer();
    });
    if (headerSubcategories) {
      const catalogMenu = headerSubcategories.querySelector(".catalog-menu");
      if (catalogMenu) {
        catalogMenu.addEventListener("mouseenter", () => {
          cancelCloseTimer();
        });
        catalogMenu.addEventListener("mouseleave", () => {
          startCloseTimer();
        });
      }
      headerSubcategories.addEventListener("click", (e) => {
        if (e.target === headerSubcategories) {
          cancelCloseTimer();
          closeCatalog();
        }
      });
    }
  }
  catalogButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isMobile()) return;
    if (headerSubcategories) {
      const isActive = headerSubcategories.classList.contains("active");
      if (isActive) {
        closeCatalog();
      } else {
        openCatalog();
      }
    }
  });
  if (headerSubcategories) {
    document.addEventListener("click", (e) => {
      if (!isMobile()) return;
      const isClickInsideCatalog = e.target.closest(".catalog-menu");
      const isClickOnButton = e.target.closest(".button-catalog");
      const isClickOnOverlay = e.target.classList.contains("header__subcategories");
      if ((!isClickInsideCatalog && !isClickOnButton || isClickOnOverlay) && headerSubcategories.classList.contains("active")) {
        closeCatalog();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && headerSubcategories.classList.contains("active")) {
        closeCatalog();
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  initCatalogButton$1();
  initCart$1();
});
function initCart() {
  const cartContainer = document.querySelector("[data-cart]");
  const cartTrigger = document.querySelector("[data-cart-trigger]");
  const cartDropdown = document.querySelector("[data-cart-dropdown]");
  if (!cartContainer || !cartTrigger || !cartDropdown) return;
  const isMobile = () => window.matchMedia("(pointer: coarse)").matches;
  if (isMobile()) {
    cartTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      cartDropdown.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!cartContainer.contains(e.target)) {
        cartDropdown.classList.remove("active");
      }
    });
  } else {
    cartContainer.addEventListener("mouseenter", () => {
      cartDropdown.classList.add("active");
    });
    cartContainer.addEventListener("mouseleave", () => {
      cartDropdown.classList.remove("active");
    });
  }
}
function initCatalogButton() {
  const catalogButton = document.querySelector(".button-catalog");
  if (!catalogButton) return;
  catalogButton.addEventListener("click", (e) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent("catalog:open"));
    console.log("Catalog button clicked");
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initCatalogButton();
  initCart();
});
class DynamicAdapt {
  constructor(type = "max") {
    this.type = type;
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.dynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
class SearchComponent {
  constructor(element) {
    this.search = element;
    this.input = element.querySelector("[data-search-input]");
    this.button = element.querySelector("[data-search-button]");
    if (!this.input || !this.button) {
      console.error("Search component: required elements not found");
      return;
    }
    this.init();
  }
  init() {
    this.button.addEventListener("click", (e) => {
      e.preventDefault();
      this.performSearch();
    });
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.performSearch();
      }
    });
    this.input.addEventListener("input", (e) => {
      this.onInputChange(e.target.value);
    });
  }
  performSearch() {
    const query = this.input.value.trim();
    if (query.length === 0) {
      this.input.focus();
      return;
    }
    document.dispatchEvent(new CustomEvent("search:perform", {
      detail: { query }
    }));
    console.log("Search query:", query);
  }
  onInputChange(value) {
    document.dispatchEvent(new CustomEvent("search:change", {
      detail: { value }
    }));
  }
  // Публичные методы
  setValue(value) {
    this.input.value = value;
  }
  getValue() {
    return this.input.value.trim();
  }
  clear() {
    this.input.value = "";
    this.input.focus();
  }
  setPlaceholder(placeholder) {
    this.input.placeholder = placeholder;
  }
}
function initSearchComponents() {
  const searchElements = document.querySelectorAll(".search");
  searchElements.forEach((element) => {
    new SearchComponent(element);
  });
  console.log(`Инициализировано ${searchElements.length} компонентов поиска`);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchComponents);
} else {
  initSearchComponents();
}
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll("[required]");
    if (formRequiredItems.length) {
      formRequiredItems.forEach((formRequiredItem) => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;
    if (formRequiredItem.type === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }
    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add("--form-error");
    formRequiredItem.parentElement.classList.add("--form-error");
    let inputError = formRequiredItem.parentElement.querySelector("[data-form-error]");
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.FLSFormErrtext) {
      formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div data-form-error>${formRequiredItem.dataset.FLSFormErrtext}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove("--form-error");
    formRequiredItem.parentElement.classList.remove("--form-error");
    if (formRequiredItem.parentElement.querySelector("[data-form-error]")) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector("[data-form-error]"));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add("--form-success");
    formRequiredItem.parentElement.classList.add("--form-success");
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove("--form-success");
    formRequiredItem.parentElement.classList.remove("--form-success");
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll("input,textarea");
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove("--form-focus");
        el.classList.remove("--form-focus");
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length) {
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
        });
      }
      if (window["FLSSelect"]) {
        let selects = form.querySelectorAll("select[data-select]");
        if (selects.length) {
          selects.forEach((select) => {
            window["FLSSelect"].selectBuild(select);
          });
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
function formInit() {
  function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
      for (const form of forms) {
        !form.hasAttribute("data-form-novalidate") ? form.setAttribute("novalidate", true) : null;
        form.addEventListener("submit", function(e) {
          const form2 = e.target;
          formSubmitAction(form2, e);
        });
        form.addEventListener("reset", function(e) {
          const form2 = e.target;
          formValidate.formClean(form2);
        });
      }
    }
    async function formSubmitAction(form, e) {
      const error = formValidate.getErrors(form);
      if (error === 0) {
        if (form.dataset.FLSForm === "ajax") {
          e.preventDefault();
          const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
          const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
          const formData = new FormData(form);
          form.classList.add("--sending");
          const response = await fetch(formAction, {
            method: formMethod,
            body: formData
          });
          if (response.ok) {
            let responseResult = await response.json();
            form.classList.remove("--sending");
            formSent(form, responseResult);
          } else {
            form.classList.remove("--sending");
          }
        } else if (form.dataset.FLSForm === "dev") {
          e.preventDefault();
          formSent(form);
        }
      } else {
        e.preventDefault();
        if (form.querySelector(".--form-error") && form.hasAttribute("data-form-gotoerr")) {
          const formGoToErrorClass = form.dataset.FLSFormGotoerr ? form.dataset.FLSFormGotoerr : ".--form-error";
          gotoBlock(formGoToErrorClass);
        }
      }
    }
    function formSent(form, responseResult = ``) {
      document.dispatchEvent(new CustomEvent("formSent", {
        detail: {
          form
        }
      }));
      setTimeout(() => {
        if (window.FLSPopup) {
          const popup = form.dataset.FLSFormPopup;
          popup ? window.FLSPopup.open(popup) : null;
        }
      }, 0);
      formValidate.formClean(form);
    }
  }
  function formFieldsInit() {
    document.body.addEventListener("focusin", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-form-nofocus")) {
          targetElement.classList.add("--form-focus");
          targetElement.parentElement.classList.add("--form-focus");
        }
        formValidate.removeError(targetElement);
        targetElement.hasAttribute("data-form-validatenow") ? formValidate.removeError(targetElement) : null;
      }
    });
    document.body.addEventListener("focusout", function(e) {
      const targetElement = e.target;
      if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
        if (!targetElement.hasAttribute("data-form-nofocus")) {
          targetElement.classList.remove("--form-focus");
          targetElement.parentElement.classList.remove("--form-focus");
        }
        targetElement.hasAttribute("data-form-validatenow") ? formValidate.validateInput(targetElement) : null;
      }
    });
  }
  formSubmit();
  formFieldsInit();
}
document.querySelector("[data-form]") ? window.addEventListener("load", formInit) : null;
class CatalogMenu {
  constructor(element) {
    this.menu = element;
    this.categories = element.querySelectorAll("[data-category]");
    this.subcategoryPanels = element.querySelectorAll("[data-subcategory-panel]");
    this.subcategoriesContainer = element.querySelector(".catalog-menu__subcategories");
    this.backButton = element.querySelector(".catalog-menu__back-btn");
    this.backToMenuButton = element.querySelector(".catalog-menu__back-to-menu-btn");
    if (!this.categories.length || !this.subcategoryPanels.length) {
      return;
    }
    this.activeCategory = null;
    this.closeTimer = null;
    this.init();
  }
  init() {
    this.isMobile = window.innerWidth <= 991;
    this.isHomePage = document.querySelector(".page--home") !== null;
    this.categories.forEach((category) => {
      const link = category.querySelector(".catalog-menu__category-link");
      const categoryId = category.getAttribute("data-category");
      if (this.isMobile) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          this.setActiveCategory(categoryId);
        });
      } else {
        category.addEventListener("mouseenter", () => {
          this.cancelCloseTimer();
          this.setActiveCategory(categoryId);
        });
      }
    });
    if (!this.isMobile) {
      this.menu.addEventListener("mouseleave", () => {
        this.startCloseTimer();
      });
      this.menu.addEventListener("mouseenter", () => {
        this.cancelCloseTimer();
      });
    }
    this.initToggleButton();
    this.initCatalogOpenListener();
    if (this.backToMenuButton) {
      this.backToMenuButton.addEventListener("click", () => {
        this.hideMenu();
      });
    }
    if (this.backButton) {
      this.backButton.addEventListener("click", () => {
        if (this.isMobile) {
          const categoriesEl = this.menu.querySelector(".catalog-menu__categories");
          if (categoriesEl) categoriesEl.style.display = "block";
          if (this.subcategoriesContainer) {
            this.subcategoriesContainer.classList.remove("active");
          }
          this.hideAll();
        }
      });
    }
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 991;
      if (wasMobile && !this.isMobile && !this.isHomePage) {
        this.hideMenu();
      }
    });
    if (this.isHomePage) {
      this.menu.classList.add("catalog-menu--home");
    } else {
      this.hideAll();
    }
  }
  // === Таймер задержки закрытия (300ms) ===
  startCloseTimer() {
    this.cancelCloseTimer();
    this.closeTimer = setTimeout(() => {
      this.hideSubcategories();
    }, 300);
  }
  cancelCloseTimer() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
  setActiveCategory(categoryId) {
    this.categories.forEach((category) => {
      category.querySelector(".catalog-menu__category-link").classList.remove("active");
    });
    const activeCategory = this.menu.querySelector(`[data-category="${categoryId}"]`);
    activeCategory.querySelector(".catalog-menu__category-link").classList.add("active");
    this.activeCategory = categoryId;
    if (this.isMobile) {
      const categoriesEl = this.menu.querySelector(".catalog-menu__categories");
      if (categoriesEl) categoriesEl.style.display = "none";
      if (this.subcategoriesContainer) {
        this.subcategoriesContainer.classList.add("active");
      }
      this.subcategoryPanels.forEach((panel) => panel.classList.remove("active"));
      const activePanel = this.menu.querySelector(`[data-subcategory-panel="${categoryId}"]`);
      if (activePanel) activePanel.classList.add("active");
    } else {
      this.subcategoryPanels.forEach((panel) => panel.classList.remove("active"));
      const activePanel = this.menu.querySelector(`[data-subcategory-panel="${categoryId}"]`);
      if (activePanel) activePanel.classList.add("active");
    }
  }
  initToggleButton() {
    const toggleButtons = document.querySelectorAll(".catalog-menu__toggle");
    toggleButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      });
    });
    document.addEventListener("click", (e) => {
      if (!this.isMobile || !this.menu.classList.contains("active")) return;
      const isToggle = e.target.closest(".catalog-menu__toggle");
      const isMenu = e.target.closest(".catalog-menu");
      const isMainMenu = e.target.closest("[data-menu]");
      const isMainMenuBody = e.target.closest(".menu__body");
      if (!isToggle && !isMenu && !isMainMenu && !isMainMenuBody) {
        this.hideMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMobile && this.menu.classList.contains("active")) {
        this.hideMenu();
      }
    });
  }
  initCatalogOpenListener() {
    document.addEventListener("catalog:open", () => {
      if (!this.isHomePage) {
        this.showMenu();
      }
    });
    document.addEventListener("catalog:close", () => {
      if (!this.isHomePage) {
        this.hideMenu();
      }
    });
  }
  toggleMenu() {
    if (this.menu.classList.contains("active")) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }
  showMenu() {
    this.menu.classList.add("active");
    if (this.isMobile) {
      const categoriesEl = this.menu.querySelector(".catalog-menu__categories");
      if (categoriesEl) categoriesEl.style.display = "block";
      if (this.subcategoriesContainer) {
        this.subcategoriesContainer.classList.remove("active");
      }
      document.body.style.overflow = "hidden";
    }
  }
  hideMenu() {
    this.menu.classList.remove("active");
    this.hideAll();
    this.cancelCloseTimer();
    if (this.isMobile) {
      const categoriesEl = this.menu.querySelector(".catalog-menu__categories");
      if (categoriesEl) categoriesEl.style.display = "block";
      if (this.subcategoriesContainer) {
        this.subcategoriesContainer.classList.remove("active");
      }
      this.resetAnimations();
      if (!document.documentElement.hasAttribute("data-menu-open")) {
        document.body.style.overflow = "";
      }
    }
  }
  resetAnimations() {
    const categoryLinks = this.menu.querySelectorAll(".catalog-menu__category-link");
    const subcategoryLinks = this.menu.querySelectorAll(".catalog-menu__subcategory-link");
    [...categoryLinks, ...subcategoryLinks].forEach((link) => {
      link.style.transitionDelay = "";
      link.style.transform = "";
      link.style.opacity = "";
    });
  }
  hideAll() {
    this.categories.forEach((category) => {
      category.querySelector(".catalog-menu__category-link").classList.remove("active");
    });
    this.subcategoryPanels.forEach((panel) => {
      panel.classList.remove("active");
    });
    this.activeCategory = null;
  }
  hideSubcategories() {
    this.categories.forEach((category) => {
      category.querySelector(".catalog-menu__category-link").classList.remove("active");
    });
    this.subcategoryPanels.forEach((panel) => {
      panel.classList.remove("active");
    });
    this.activeCategory = null;
  }
}
function initCatalogMenus() {
  const catalogMenus = document.querySelectorAll(".catalog-menu");
  catalogMenus.forEach((menu) => {
    new CatalogMenu(menu);
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCatalogMenus);
} else {
  initCatalogMenus();
}
function preloader() {
  const preloaderImages = document.querySelectorAll("img");
  const htmlDocument = document.documentElement;
  const isPreloaded = localStorage.getItem(location.href) && document.querySelector('[data-preloader="true"]');
  if (preloaderImages.length && !isPreloaded) {
    let setValueProgress = function(progress2) {
      showPecentLoad ? showPecentLoad.innerText = `${progress2}%` : null;
      showLineLoad ? showLineLoad.style.width = `${progress2}%` : null;
    }, imageLoaded = function() {
      imagesLoadedCount++;
      progress = Math.round(100 / preloaderImages.length * imagesLoadedCount);
      const intervalId = setInterval(() => {
        counter >= progress ? clearInterval(intervalId) : setValueProgress(++counter);
        counter >= 100 ? addLoadedClass() : null;
      }, 10);
    };
    const preloaderTemplate = `
			<div class="preloader">
				<div class="preloader__body">
					<div class="preloader__counter">0%</div>
					<div class="preloader__line"><span></span></div>
				</div>
			</div>`;
    document.body.insertAdjacentHTML("beforeend", preloaderTemplate);
    document.querySelector(".preloader");
    const showPecentLoad = document.querySelector(".preloader__counter"), showLineLoad = document.querySelector(".preloader__line span");
    let imagesLoadedCount = 0;
    let counter = 0;
    let progress = 0;
    htmlDocument.setAttribute("data-preloader-loading", "");
    htmlDocument.setAttribute("data-scrolllock", "");
    preloaderImages.forEach((preloaderImage) => {
      const imgClone = document.createElement("img");
      if (imgClone) {
        imgClone.onload = imageLoaded;
        imgClone.onerror = imageLoaded;
        preloaderImage.dataset.src ? imgClone.src = preloaderImage.dataset.src : imgClone.src = preloaderImage.src;
      }
    });
    setValueProgress(progress);
    const preloaderOnce = () => localStorage.setItem(location.href, "preloaded");
    document.querySelector('[data-preloader="true"]') ? preloaderOnce() : null;
  } else {
    addLoadedClass();
  }
  function addLoadedClass() {
    htmlDocument.setAttribute("data-preloader-loaded", "");
    htmlDocument.removeAttribute("data-preloader-loading");
    htmlDocument.removeAttribute("data-scrolllock");
  }
}
document.addEventListener("DOMContentLoaded", preloader);
(function() {
  const pageControls = document.querySelector(".page-controls");
  const buttonToTop = document.querySelector(".button-to-top");
  if (!pageControls || !buttonToTop) {
    console.error("Не найдены необходимые элементы");
    return;
  }
  const SCROLL_THRESHOLD = 100;
  let isScrolling = false;
  function handleScroll() {
    if (isScrolling) return;
    isScrolling = true;
    requestAnimationFrame(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > SCROLL_THRESHOLD) {
        pageControls.classList.add("visible");
      } else {
        pageControls.classList.remove("visible");
      }
      isScrolling = false;
    });
  }
  function scrollToTop(e) {
    e.preventDefault();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === 0) return;
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  buttonToTop.addEventListener("click", scrollToTop);
  handleScroll();
  window.addEventListener("beforeunload", () => {
    window.removeEventListener("scroll", handleScroll);
    buttonToTop.removeEventListener("click", scrollToTop);
  });
})();
class CustomDropdown {
  constructor(element) {
    if (!element) return;
    this.dropdown = element;
    this.toggle = element.querySelector("[data-dropdown-toggle]");
    this.menu = element.querySelector("[data-dropdown-menu]");
    if (!this.toggle || !this.menu) return;
    this.items = Array.from(this.menu.children).filter(
      (child) => child.hasAttribute("data-value")
    );
    if (this.items.length === 0) return;
    this.isOpen = false;
    this.selectedValue = null;
    this.placeholderText = this.toggle.textContent.trim();
    this.init();
    this.dropdown._dropdownInstance = this;
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
  }
  toggleMenu() {
    this.isOpen ? this.close() : this.open();
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
        this.toggle.insertBefore(
          document.createTextNode(itemText),
          this.toggle.firstChild
        );
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
}
function initDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  if (!dropdowns.length) return;
  dropdowns.forEach((dd) => new CustomDropdown(dd));
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
export {
  setHash as a,
  slideUp as b,
  slideToggle as c,
  dataMediaQueries as d,
  formValidate as f,
  getHash as g,
  slideDown as s
};
