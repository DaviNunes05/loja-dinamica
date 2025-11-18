
import { mostrarToast } from './toast.js';
import { logado } from './auth.js';

const Produtos = {
  listar() {
    return JSON.parse(localStorage.getItem('products') || '[]');
  },

  removerProduto(productId) {
    const lista = Produtos.listar();
    const nova = lista.filter((p) => String(p.id) !== String(productId));
    Produtos.salvarLista(nova);
    try { Produtos.renderizarProdutos(); } catch (e) {}
  },

  salvarLista(lista) {
    localStorage.setItem('products', JSON.stringify(lista));
  },

  salvarProduto(produto) {
    const atual = Produtos.listar();
    atual.push(produto);
    Produtos.salvarLista(atual);
  },

  mostrarModalCadastro() {
    const modalEl = document.getElementById('produtoModal');
    if (!modalEl) {
      console.error('Modal de produto não encontrado no HTML.');
      return;
    }

    const bsModal = new bootstrap.Modal(modalEl, { backdrop: 'static' });
    bsModal.show();

    const formulario = modalEl.querySelector('#produtoForm');
    formulario.reset();

    const onSubmit = (ev) => {
      ev.preventDefault();

      const nome = formulario.querySelector('#produtoNome').value.trim();
      const preco = parseFloat(formulario.querySelector('#produtoPreco').value);
      const desc = formulario.querySelector('#produtoDesc').value.trim();
  const imgFileInput = formulario.querySelector('#produtoImgFile');

      if (!nome) {
        mostrarToast('Nome do produto é obrigatório.', 'danger');
        return;
      }
      if (Number.isNaN(preco) || preco < 0) {
        mostrarToast('Preço inválido.', 'danger');
        return;
      }

      const criarSalvar = (imagemResolvida) => {
        const produto = {
          id: Date.now(),
          nome: nome,
          preco: preco,
          descricao: desc,
          imagem: imagemResolvida || ''
        };

        Produtos.salvarProduto(produto);
        mostrarToast('Produto salvo com sucesso!', 'success');

        try {
          Produtos.renderizarProdutos();
        } catch (e) {}

        bsModal.hide();
        formulario.onsubmit = null;
      };

      if (imgFileInput && imgFileInput.files && imgFileInput.files.length > 0) {
        const file = imgFileInput.files[0];
        if (file.size > 1_500_000) {
          mostrarToast('Imagem muito grande. Tente uma imagem menor (≤1.5MB).', 'warning');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          criarSalvar(dataUrl);
        };
        reader.onerror = () => {
          mostrarToast('Erro ao ler o arquivo de imagem.', 'danger');
        };
        reader.readAsDataURL(file);
      } else {
        criarSalvar('');
      }
    };

    formulario.onsubmit = onSubmit;
  }
  ,
  renderizarProdutos(containerId = 'app') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const produtos = Produtos.listar();

    const header = document.createElement('div');
    header.className = 'store-header mb-3';
    header.innerHTML = `<h4 class="m-0">Produtos</h4>`;

    const grid = document.createElement('div');
    grid.className = 'produtos-grid';

    if (produtos.length === 0) {
      const vazio = document.createElement('div');
      vazio.className = 'main-center';
      vazio.innerHTML = '<p class="text-muted">Nenhum produto cadastrado ainda.</p>';
      container.innerHTML = '';
      container.appendChild(header);
      container.appendChild(vazio);
      return;
    }

    produtos.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'card produtos-card shadow-sm';

      const isOwner = logado();
      const buttonsHtml = `
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-success btn-add-cart" data-product-id="${p.id}">Adicionar</button>
          ${isOwner ? `<button class="btn btn-sm btn-outline-danger btn-delete-product" data-product-id="${p.id}">Excluir</button>` : ''}
        </div>`;

      card.innerHTML = `
        <img src="${p.imagem || 'https://via.placeholder.com/300x200?text=Sem+imagem'}" class="card-img-top" alt="${p.nome}">
        <div class="card-body p-2">
          <h6 class="card-title mb-1">${p.nome}</h6>
          <p class="card-text text-muted small mb-2">${p.descricao || ''}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold">R$ ${Number(p.preco).toFixed(2)}</span>
            ${buttonsHtml}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(header);
    container.appendChild(grid);
  }
};

export default Produtos;
