import Produtos from './produtos.js';
import { mostrarToast } from './toast.js';

const Carrinho = {
  obter() {
    return JSON.parse(localStorage.getItem('carrinho') || '[]');
  },

  salvar(items) {
    localStorage.setItem('carrinho', JSON.stringify(items));
  },

  adicionar(productId, quantidade = 1) {
    const atual = Carrinho.obter();
    const existe = atual.find((i) => String(i.productId) === String(productId));
    if (existe) {
      existe.qtd = (existe.qtd || 0) + quantidade;
    } else {
      atual.push({ productId: String(productId), qtd: quantidade });
    }
    Carrinho.salvar(atual);
    Carrinho.atualizarBadge();
  },

  remover(productId) {
    const atual = Carrinho.obter().filter((i) => String(i.productId) !== String(productId));
    Carrinho.salvar(atual);
    Carrinho.atualizarBadge();
  },

  atualizarQuantidade(productId, quantidade) {
    const atual = Carrinho.obter();
    const item = atual.find((i) => String(i.productId) === String(productId));
    if (!item) return;
    item.qtd = quantidade;
    if (item.qtd <= 0) {
      Carrinho.remover(productId);
      return;
    }
    Carrinho.salvar(atual);
    Carrinho.atualizarBadge();
  },

  limpar() {
    Carrinho.salvar([]);
    Carrinho.atualizarBadge();
  },

  contarItems() {
    return Carrinho.obter().reduce((soma, item) => soma + (item.qtd || 0), 0);
  },

  listarDetalhado() {
    const itens = Carrinho.obter();
    const produtos = Produtos.listar();
    return itens.map((item) => ({
      productId: item.productId,
      qtd: item.qtd,
      produto: produtos.find((produto) => String(produto.id) === String(item.productId)) || null,
    }));
  },

  calcularTotal() {
    return Carrinho.listarDetalhado().reduce((s, it) => s + (it.produto ? Number(it.produto.preco) * it.qtd : 0), 0);
  },

  atualizarBadge() {
    const el = document.getElementById('contadorCarrinho');
    if (!el) return;
    const total = Carrinho.contarItems();
    if (total > 0) {
      el.style.display = 'inline-block';
      el.textContent = total;
    } else {
      el.style.display = 'none';
      el.textContent = '0';
    }
  },

  renderizarModal(modalId = 'carrinhoModal') {
    const body = document.getElementById('carrinhoModalBody');
    if (!body) return;

    const itens = Carrinho.listarDetalhado();
    body.innerHTML = '';

    if (!itens || itens.length === 0) {
      body.innerHTML = '<p class="text-muted">Seu carrinho está vazio.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Produto</th>
          <th style="width:100px">Qtd</th>
          <th style="width:120px">Preço</th>
          <th style="width:140px">Subtotal</th>
          <th style="width:80px"></th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');

    itens.forEach((item) => {
      const prod = item.produto;
      const nome = prod ? prod.nome : 'Produto removido';
      const precoUnit = prod ? Number(prod.preco).toFixed(2) : '0.00';
      const subtotal = prod ? (Number(prod.preco) * item.qtd).toFixed(2) : '0.00';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nome}</td>
        <td><input type="number" min="1" value="${item.qtd}" data-product-id="${item.productId}" class="form-control form-control-sm qtd-input" style="width:80px"></td>
        <td>R$ ${precoUnit}</td>
        <td>R$ ${subtotal}</td>
        <td><button class="btn btn-sm btn-outline-danger btn-remove-item" data-product-id="${item.productId}">Remover</button></td>
      `;

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    body.appendChild(table);

    const totalEl = document.createElement('div');
    totalEl.className = 'mt-3 d-flex justify-content-between align-items-center';
    totalEl.innerHTML = `<strong>Total:</strong> <span class="fw-bold">R$ ${Carrinho.calcularTotal().toFixed(2)}</span>`;
    body.appendChild(totalEl);

    // handlers
    body.querySelectorAll('.qtd-input').forEach((input) => {
      input.addEventListener('change', () => {
        const pid = input.getAttribute('data-product-id');
        const val = parseInt(input.value, 10) || 1;
        Carrinho.atualizarQuantidade(pid, val);
        Carrinho.renderizarModal(modalId);
      });
    });

    body.querySelectorAll('.btn-remove-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-product-id');
        Carrinho.remover(pid);
        Carrinho.renderizarModal(modalId);
      });
    });
  },

  enviarWhatsApp() {
    try {
      const cfg = JSON.parse(localStorage.getItem('store_config') || 'null');
      if (!cfg || !cfg.whatsapp) {
        mostrarToast('WhatsApp da loja não configurado.', 'warning');
        return;
      }

      const itens = Carrinho.listarDetalhado();
      if (!itens || itens.length === 0) {
        mostrarToast('Carrinho vazio.', 'info');
        return;
      }

      const linhas = itens.map((item) => {
        const nome = item.produto ? item.produto.nome : 'Produto removido';
        const subtotal = item.produto ? (Number(item.produto.preco) * item.qtd).toFixed(2) : '0.00';
        return `- ${nome} x${item.qtd} = R$ ${subtotal}`;
      });

      const total = Carrinho.calcularTotal().toFixed(2);
      const mensagem = `Pedido via site:%0A${linhas.join('%0A')}%0A%0ATotal: R$ ${total}`;
      const phone = cfg.whatsapp.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phone}?text=${mensagem}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Erro ao enviar WhatsApp:', err);
      mostrarToast('Erro ao abrir WhatsApp.', 'danger');
    }
  },
};

export default Carrinho;
