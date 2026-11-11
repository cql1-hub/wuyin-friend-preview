/* 主界面入口：沉银弱文字，不做成第二颗主按钮。由 exhibition/v2/index.html 引入。 */
const href = new URL("./viewing-room.html", import.meta.url).href;

function place() {
  if (document.querySelector("a.viewing-room-entry")) return;
  const link = document.createElement("a");
  link.className = "viewing-room-entry";
  link.href = href;
  link.textContent = "观景室";
  link.setAttribute("aria-label", "进入观景室");
  const brand = document.querySelector("header .brand");
  if (brand) brand.after(link);
  else (document.querySelector("header") || document.body).append(link);
  if (!document.getElementById("viewing-room-entry-style")) {
    const style = document.createElement("style");
    style.id = "viewing-room-entry-style";
    style.textContent = `
      a.viewing-room-entry{
        margin-left:1.1em;
        color:#9aa3ab;
        text-decoration:none;
        font:400 12px/1 "Noto Serif SC","Source Han Serif SC","Songti SC",serif;
        letter-spacing:.22em;
        opacity:.72;
        white-space:nowrap;
        align-self:center;
      }
      a.viewing-room-entry:hover,
      a.viewing-room-entry:focus-visible{opacity:1;outline:none}
    `;
    document.head.append(style);
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", place);
else place();
