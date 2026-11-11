/* 观景室遗物呈现：为展位加上悬停淡光，并在选中时切换气氛图。
   对外事件：exhibit:select  { relic, name }
              exhibit:close
   不改摄像头识别，不碰 3D 秘仪。 */
(function (global) {
  const RELICS = [
    { id: "arodes", name: "阿罗德斯", art: "relics/relic-arrodes.png", mood: "relics/ref-arrodes.jpg" },
    { id: "pendulum", name: "黄水晶灵摆", art: "relics/relic-pendulum.png", mood: "relics/ref-pendulum-final.jpg" },
    { id: "cards", name: "亵渎之牌", art: "relics/relic-cards.png", mood: "relics/bg-hall.jpg" },
    { id: "notes", name: "安提哥努斯笔记", art: "relics/relic-notes.png", mood: "relics/ref-notes.jpg" },
  ];

  const byId = Object.fromEntries(RELICS.map((item) => [item.id, item]));

  function enhanceSpot(spot) {
    if (!spot || spot.dataset.exhibitEnhanced === "1") return spot;
    spot.dataset.exhibitEnhanced = "1";
    if (!spot.querySelector(".exhibit-glow")) {
      const glow = document.createElement("span");
      glow.className = "exhibit-glow";
      glow.setAttribute("aria-hidden", "true");
      spot.insertBefore(glow, spot.firstChild);
    }
    const relic = byId[spot.getAttribute("data-relic")];
    if (relic && !spot.getAttribute("aria-label")) {
      spot.setAttribute("aria-label", relic.name);
    }
    if (!spot.getAttribute("type") && spot.tagName === "BUTTON") {
      spot.setAttribute("type", "button");
    }
    return spot;
  }

  function closeFeatures(root) {
    root.querySelectorAll(".exhibit-feature.is-open").forEach((node) => {
      node.classList.remove("is-open");
      node.setAttribute("data-open", "false");
      node.setAttribute("hidden", "");
    });
    root.classList.remove("is-featuring");
    root.removeAttribute("data-open-relic");
    root.querySelectorAll(".exhibit-spot.is-lit").forEach((spot) => {
      spot.classList.remove("is-lit");
    });
    root.dispatchEvent(new CustomEvent("exhibit:close", { bubbles: true }));
  }

  function openFeature(root, id, fromSpot) {
    const relic = byId[id];
    if (!relic) return;
    root.querySelectorAll(".exhibit-feature").forEach((node) => {
      const on = node.getAttribute("data-relic") === id;
      node.classList.toggle("is-open", on);
      node.setAttribute("data-open", on ? "true" : "false");
      if (on) node.removeAttribute("hidden");
      else node.setAttribute("hidden", "");
    });
    root.classList.add("is-featuring");
    root.setAttribute("data-open-relic", id);
    root.querySelectorAll(".exhibit-spot").forEach((spot) => {
      spot.classList.toggle("is-lit", spot === fromSpot);
    });
    root.dispatchEvent(
      new CustomEvent("exhibit:select", { bubbles: true, detail: { relic: id, name: relic.name } })
    );
  }

  function bindRoom(root) {
    if (!root || root.dataset.exhibitBound === "1") return root;
    root.dataset.exhibitBound = "1";
    root.querySelectorAll(".exhibit-spot").forEach(enhanceSpot);

    root.addEventListener("click", (event) => {
      const back = event.target.closest(".exhibit-back");
      if (back && root.contains(back)) {
        event.preventDefault();
        closeFeatures(root);
        return;
      }
      const spot = event.target.closest(".exhibit-spot");
      if (spot && root.contains(spot)) {
        event.preventDefault();
        openFeature(root, spot.getAttribute("data-relic"), spot);
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("is-featuring")) {
        event.preventDefault();
        closeFeatures(root);
      }
    });

    return root;
  }

  function mount(root) {
    if (!root) return null;
    root.querySelectorAll(".exhibit-spot").forEach(enhanceSpot);
    return bindRoom(root);
  }

  function enhance(scope) {
    const root = scope || document;
    root.querySelectorAll(".exhibit-spot").forEach(enhanceSpot);
    root.querySelectorAll("[data-viewing-room], .viewing-room").forEach(bindRoom);
  }

  global.ViewingRelics = {
    RELICS,
    enhanceSpot,
    enhance,
    mount,
    openFeature,
    closeFeatures,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enhance(document));
  } else {
    enhance(document);
  }
})(window);
