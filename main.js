const params = new URLSearchParams(window.location.search);
const folderId = params.get("folder") || "1"; // carpeta raíz por defecto

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  chrome.bookmarks.get(folderId, (nodes) => {
    configureBackButton(nodes);
    configureTitle(nodes);
  });
  chrome.bookmarks.getChildren(folderId, function(children) {
    processChildren(children);
  });
});

function processChildren(children) {
  const links = []; // Array para almacenar los favoritos
  const folders = [];
  children.forEach((child) => {
    if (child.url) {
      links.push({href:child.url, imgSrc:"img/link.png", title:child.title});
    } else {
      folders.push({href:`index.html?folder=${child.id}`, imgSrc:"img/folder.png", title:child.title});
    }
  });
  renderItems(folders);
  getImgSrc(links)
    .then(() => {
      renderItems(links);
    })
    .catch((err) => {
      console.error("Error al cargar íconos:", err);
      renderItems(links); // Igual renderizamos con íconos por defecto
    });
}

function renderItems(items) {
  const container = document.getElementById("links-container");
  if (!container) return;
  items.forEach(({ href, imgSrc, title }) => {
    // Crear el <a>
    const a = document.createElement("a");
    a.className = "link";
    a.href = href;
    // Crear la imagen
    const img = document.createElement("img");
    img.className = "link-img";
    img.src = imgSrc;
    img.alt = "Icono";
    img.onerror = () => {
      img.src = "img/link.png";
    };
    // Crear el span
    const span = document.createElement("span");
    span.className = "link-text";
    span.textContent = title;
    // Armar estructura
    a.appendChild(img);
    a.appendChild(span);
    // Agregar al contenedor
    container.appendChild(a);
  });
}

function configureBackButton(nodes) {
  const node = nodes[0];
  const back = document.getElementById("back");
  if (!node.parentId) {
    back.style.visibility = "hidden";
  } else {
    back.href = `index.html?folder=${node.parentId}`;
    back.style.visibility = "visible";
  }
}

function configureTitle(nodes) {
  const node = nodes[0];
  const title = document.getElementById("title");
  if (!node.title || node.title === "") {
    title.innerHTML = "Bookmarks";
  } else {
    title.innerHTML = node.title;
  }
}

function getImgSrc(links) {
  // Cargar los íconos personalizados desde icons.json
  return fetch("icons.json")
    .then((response) => response.json())
    .then((customIcons) => {
      links.forEach((link) => {
        const domain = new URL(link.href).hostname.replace(/^www\./, ""); // Normalizar el dominio eliminando "www."
        // Buscar íconos personalizados con coincidencia parcial
        const customIcon = Object.keys(customIcons).find((key) =>
          domain.startsWith(key)
        );
        if (customIcon) {
          link.imgSrc = customIcons[customIcon];
        } else {
          // Usar Clearbit Logo API como fallback
          const faviconUrl = `https://logo.clearbit.com/${domain}`;
          link.imgSrc = faviconUrl;
        }
        console.log(link.imgSrc)
      });
    })
    .catch((error) => {
      console.error("Error al cargar icons.json:", error);
    });
}
