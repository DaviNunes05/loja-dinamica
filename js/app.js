import { inicializarAutenticacao, mostrarModalLogin, logout, atualizarBotoesAuth } from './auth.js';
import Produtos from './produtos.js';
import { mostrarToast } from './toast.js';
import Carrinho from './carrinho.js';


document.addEventListener('DOMContentLoaded', () => {
  inicializarAutenticacao();

  try {
    Produtos.renderizarProdutos();
  } catch (e) {}

  const btnNovo = document.getElementById('btnNovoProduto');
  if (btnNovo) {
    btnNovo.addEventListener('click', () => {
      Produtos.mostrarModalCadastro();
    });
  }
  const btnLogin = document.getElementById('btnLogin');
  if (btnLogin) {
    btnLogin.addEventListener('click', () => mostrarModalLogin());
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      logout();
      mostrarToast('Sessão encerrada', 'secondary');
      try { atualizarBotoesAuth(); } catch (e) {}
    });
  }

  try { Carrinho.atualizarBadge(); } catch (e) {}

  document.addEventListener('auth:changed', () => {
    try {
      atualizarBotoesAuth();
    } catch (e) {}
    try { Produtos.renderizarProdutos(); } catch (e) {}
    try { Carrinho.atualizarBadge(); } catch (e) {}
  });

  document.addEventListener('click', (ev) => {
    const addBtn = ev.target.closest && ev.target.closest('.btn-add-cart');
    if (addBtn) {
      const prodId = addBtn.getAttribute('data-product-id');
      if (prodId) {
        Carrinho.adicionar(prodId, 1);
        mostrarToast('Produto adicionado ao carrinho', 'success');
      }
      return;
    }

    const delBtn = ev.target.closest && ev.target.closest('.btn-delete-product');
    if (delBtn) {
      const prodId = delBtn.getAttribute('data-product-id');
      if (!prodId) return;
      if (!confirm('Deseja realmente excluir este produto?')) return;
      try {
        Produtos.removerProduto(prodId);
        try { Carrinho.remover(prodId); Carrinho.atualizarBadge(); } catch (e) {}
        mostrarToast('Produto excluído.', 'secondary');
      } catch (err) {
        console.error('Erro ao excluir produto:', err);
        mostrarToast('Erro ao excluir produto.', 'danger');
      }
      return;
    }
  });

  const btnCarrinho = document.getElementById('btnCarrinho');
  if (btnCarrinho) {
    btnCarrinho.addEventListener('click', () => {
      console.debug('[App] Abrindo modal do carrinho...');
      try {
        try { console.debug('[App] carrinho (raw):', Carrinho.obter()); } catch (e) {}
        Carrinho.renderizarModal('carrinhoModal');
      } catch (err) {
        console.error('Erro ao renderizar modal do carrinho:', err);
        mostrarToast('Erro ao abrir carrinho. Veja console.', 'danger');
      }
      const modalEl = document.getElementById('carrinhoModal');
      if (!modalEl) {
        mostrarToast('Modal do carrinho não encontrado.', 'danger');
        return;
      }
      const bs = new bootstrap.Modal(modalEl, {});
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
      document.body.classList.remove('modal-open');
      bs.show();
    });
  }

  const btnClear = document.getElementById('btnLimparCarrinho');
  if (btnClear) btnClear.addEventListener('click', () => { Carrinho.limpar(); Carrinho.renderizarModal('carrinhoModal'); mostrarToast('Carrinho limpo', 'secondary'); });

  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) btnCheckout.addEventListener('click', () => { Carrinho.enviarWhatsApp(); });
});
