const NAMES = {
  arodes: "阿罗德斯",
  pendulum: "黄水晶灵摆",
  cards: "亵渎之牌",
  notes: "安提哥努斯笔记",
};

const hall = document.querySelector(".hall");
const nameEl = document.querySelector(".exhibit-name");
const backBtn = document.querySelector(".hall-return");

function showOverview() {
  hall.dataset.view = "overview";
  delete hall.dataset.focus;
  nameEl.hidden = true;
  nameEl.textContent = "";
  backBtn.hidden = true;
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

function showFocus(id) {
  if (!NAMES[id]) return;
  hall.dataset.view = "focus";
  hall.dataset.focus = id;
  nameEl.hidden = false;
  nameEl.textContent = `「${NAMES[id]}」`;
  backBtn.hidden = false;
  if (location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
}

hall.addEventListener("click", (event) => {
  const spot = event.target.closest(".exhibit-spot");
  if (spot) {
    const id = spot.dataset.relic;
    if (hall.dataset.view === "focus" && hall.dataset.focus === id) showOverview();
    else showFocus(id);
    return;
  }
  if (event.target.closest(".hall-return, .hall-back-to-chamber")) return;
  if (hall.dataset.view === "focus") showOverview();
});

backBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  showOverview();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && hall.dataset.view === "focus") showOverview();
});

const initial = location.hash.replace(/^#/, "");
if (NAMES[initial]) showFocus(initial);

