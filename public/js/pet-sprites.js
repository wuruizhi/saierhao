// Pet sprite renderer - uses PNG images
function renderPetSprite(container, petId, size) {
  if (!container) return;
  const s = size || 80;
  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = `/img/pets/${petId}.png`;
  img.alt = `Pet ${petId}`;
  img.style.width = s + 'px';
  img.style.height = s + 'px';
  img.style.objectFit = 'contain';
  img.style.imageRendering = 'auto';
  img.draggable = false;
  img.onerror = function() {
    // Fallback to emoji if image not found
    container.innerHTML = `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;font-size:${s*0.5}px">❓</div>`;
  };
  container.appendChild(img);
}
