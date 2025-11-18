export function mostrarToast(mensagem, tipo = 'primary', atraso = 4000) {
  let containerEl = document.getElementById('toastContainer');
    containerEl = document.createElement('div');
    containerEl.id = 'toastContainer';
    containerEl.className = 'position-fixed top-0 end-0 p-3';
    containerEl.style.zIndex = '1080';
    document.body.appendChild(containerEl);

  const toastElemento = document.createElement('div');
  const classeFundo = `text-bg-${tipo}`;
  toastElemento.className = `toast align-items-center ${classeFundo} border-0`;
  toastElemento.setAttribute('role', 'alert');
  toastElemento.setAttribute('aria-live', 'assertive');
  toastElemento.setAttribute('aria-atomic', 'true');

  toastElemento.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensagem}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  containerEl.appendChild(toastElemento);

  const toastBs = new bootstrap.Toast(toastElemento, { delay: atraso });
  toastBs.show();

  toastElemento.addEventListener('hidden.bs.toast', () => {
    toastElemento.remove();
  });
}
