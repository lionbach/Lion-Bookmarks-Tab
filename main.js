document.addEventListener("DOMContentLoaded", () => {
  const bookmarksList = document.getElementById("bookmarks-list");
  const folderTitle = document.getElementById("folder"); // Elemento h2 para mostrar el nombre de la carpeta actual
  const header = document.getElementById("header"); // Contenedor del título y el botón de retroceso
  const pathStack = []; // Stack to keep track of navigation path

  // Crear el botón de retroceso
  const backIcon = document.createElement("img");
  backIcon.id = "icon-back";
  backIcon.className = "icon-back";
  backIcon.src = "img/back.png";
  backIcon.alt = "Atras";
  backIcon.style.display = "none"; // Ocultar inicialmente en la raíz
  header.appendChild(backIcon);

  // Agregar funcionalidad al botón de retroceso
  backIcon.addEventListener("click", () => {
    if (pathStack.length > 0) {
      const previousLevel = pathStack.pop(); // Volver al nivel anterior
      updateFolderTitle(previousLevel.title); // Restaurar el título de la carpeta anterior
      displayBookmarks(previousLevel.nodes, bookmarksList); // Mostrar los elementos del nivel anterior

      // Ocultar el botón de retroceso si estamos en la raíz
      if (pathStack.length === 0) {
        backIcon.style.display = "none";
      }
    }
  });

  chrome.bookmarks.getTree((bookmarks) => {
    // Buscar la carpeta "Barra de favoritos" (Bookmarks Bar)
    const bookmarksBar = bookmarks[0].children.find(
      (node) => node.title === "Bookmarks bar" || node.title === "Barra de favoritos"
    );

    if (bookmarksBar) {
      // Agregar la raíz al pathStack para permitir volver a ella
      pathStack.push({
        nodes: bookmarks[0].children,
        title: "Bookmarks",
      });

      updateFolderTitle(bookmarksBar.title); // Set initial title to "Barra de favoritos"
      displayBookmarks(bookmarksBar.children, bookmarksList); // Display its contents
      backIcon.style.display = "block"; // Mostrar el botón de retroceso
    } else {
      // Si no se encuentra la carpeta, mostrar la raíz como fallback
      const rootNodes = bookmarks[0].children;
      updateFolderTitle("Bookmarks"); // Set initial title
      displayBookmarks(rootNodes, bookmarksList);
    }
  });

  function displayBookmarks(nodes, parentElement) {
    parentElement.innerHTML = ""; // Clear the current list

    // Cargar los íconos personalizados desde icons.json
    fetch("icons.json")
      .then((response) => response.json())
      .then((customIcons) => {
        nodes.forEach((node) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";

          if (node.children) {
            // Si el nodo es una carpeta
            const folderIcon = document.createElement("img");
            folderIcon.className = "icon";
            folderIcon.src = "img/folder.png";
            folderIcon.alt = "Carpeta";

            const folderName = document.createElement("span");
            folderName.textContent = truncateText(node.title, 48); // Truncar si excede 32 caracteres

            itemDiv.appendChild(folderIcon);
            itemDiv.appendChild(folderName);

            itemDiv.addEventListener("click", () => {
              pathStack.push({ nodes, title: folderTitle.textContent }); // Guardar el nivel actual y el título
              updateFolderTitle(node.title); // Actualizar el título de la carpeta
              displayBookmarks(node.children, parentElement); // Navegar a la carpeta
              backIcon.style.display = "block"; // Mostrar el botón de retroceso
            });
          } else if (node.url) {
            // Si el nodo es un favorito
            const linkIcon = document.createElement("img");
            linkIcon.className = "icon";

            const domain = new URL(node.url).hostname.replace(/^www\./, ""); // Normalizar el dominio eliminando "www."

            // Buscar íconos personalizados con coincidencia parcial
            const customIcon = Object.keys(customIcons).find((key) =>
              domain.startsWith(key)
            );

            if (customIcon) {
              linkIcon.src = customIcons[customIcon];
            } else {
              // Usar Clearbit Logo API como fallback
              const faviconUrl = `https://logo.clearbit.com/${domain}`;
              linkIcon.src = faviconUrl;

              // Si no se puede cargar el favicon, usar el ícono predeterminado
              linkIcon.onerror = () => {
                linkIcon.src = "img/link.png";
              };
            }

            linkIcon.alt = "Archivo";

            const linkName = document.createElement("span");
            linkName.textContent = truncateText(node.title, 48); // Truncar si excede 32 caracteres

            itemDiv.appendChild(linkIcon);
            itemDiv.appendChild(linkName);

            itemDiv.addEventListener("click", () => {
              window.location.href = node.url; // Abrir el enlace en la misma pestaña
            });
          }

          parentElement.appendChild(itemDiv);
        });
      })
      .catch((error) => {
        console.error("Error al cargar icons.json:", error);
      });
  }

  function updateFolderTitle(title) {
    folderTitle.textContent = title; // Update the h2 element with the current folder name
  }

  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
  }
});
