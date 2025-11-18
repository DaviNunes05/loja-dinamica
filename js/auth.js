
import { mostrarToast } from './toast.js';

function atualizarTituloDaPagina() {
  try {
    const configuracaoLoja = JSON.parse(localStorage.getItem('store_config') || 'null');
    const tituloEl = document.getElementById('pageTitle');
    if (configuracaoLoja && tituloEl) tituloEl.textContent = configuracaoLoja.storeName || tituloEl.textContent;
    // também atualiza o texto do navbar quando existir
    const navEl = document.getElementById('navStoreName');
    if (configuracaoLoja && navEl) navEl.textContent = configuracaoLoja.storeName || navEl.textContent;
  } catch (e) {
    // ignore
  }
}

function validarEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function validarWhatsApp(numero) {
  return /^55\d{11}$/.test(numero);
}

export function mostrarSetupInicial() {
  if (localStorage.getItem('store_config')) return;
  const modalEl = document.getElementById('setupModal');
  if (!modalEl) {
    console.error('Modal de setup não encontrado no HTML.');
    return;
  }

  const modal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
  modal.show();

  const formulario = modalEl.querySelector('#setupForm');

  const onSubmit = (ev) => {
    ev.preventDefault();
    const nomeLoja = formulario.querySelector('#storeName').value.trim();
    const emailDono = formulario.querySelector('#emailDono').value.trim().toLowerCase();
    const senhaDono = formulario.querySelector('#senhaDono').value;
    const numeroWhatsapp = formulario.querySelector('#whatsapp').value.trim();

    if (!nomeLoja) {
      mostrarToast('Nome da loja é obrigatório.', 'danger');
      return;
    }
    if (!validarEmail(emailDono)) {
      mostrarToast('Email inválido.', 'danger');
      return;
    }
    if (!senhaDono || senhaDono.length < 6) {
      mostrarToast('Senha deve ter pelo menos 6 caracteres.', 'danger');
      return;
    }
    if (!validarWhatsApp(numeroWhatsapp)) {
      mostrarToast('WhatsApp deve seguir o formato 5521999999999.', 'danger');
      return;
    }

    const configLoja = {
      storeName: nomeLoja,
      emailDono: emailDono,
      senhaDono: btoa(senhaDono),
      whatsapp: numeroWhatsapp
    };
    localStorage.setItem('store_config', JSON.stringify(configLoja));

    atualizarTituloDaPagina();

    mostrarToast('Loja criada com sucesso!', 'success', 1500);

    setTimeout(() => {
      try {
        modal.hide();
        // não removemos o modal do DOM (estático no HTML)
      } catch (e) {}
    }, 1100);
  };

  // substituir handler anterior (evita múltiplos handlers)
  formulario.onsubmit = onSubmit;
}

export function logado() {
  return sessionStorage.getItem('isOwnerLogged') === 'true';
}

export function login(email, password) {
  const cfg = JSON.parse(localStorage.getItem('store_config') || 'null');
  if (!cfg) return { ok: false, msg: 'Loja não cadastrada. Faça o setup inicial.' };
  if (!email || !password) return { ok: false, msg: 'Email e senha são necessários.' };
  if (email.toLowerCase() === cfg.emailDono && btoa(password) === cfg.senhaDono) {
    sessionStorage.setItem('isOwnerLogged', 'true');
    // notifica a aplicação que o estado de autenticação mudou
    try { document.dispatchEvent(new CustomEvent('auth:changed')); } catch (e) {}
    return { ok: true };
  }
  return { ok: false, msg: 'Credenciais inválidas.' };
}

export function logout() {
  sessionStorage.removeItem('isOwnerLogged');
  try { document.dispatchEvent(new CustomEvent('auth:changed')); } catch (e) {}
}
 
// Atualiza visibilidade dos botões de autenticação no navbar
export function atualizarBotoesAuth() {
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');
  const btnNovo = document.getElementById('btnNovoProduto');
  const owner = logado();
  if (btnLogin) btnLogin.classList.toggle('d-none', owner);
  if (btnLogout) btnLogout.classList.toggle('d-none', !owner);
  // opcional: esconder botão de novo produto para não-donos
  if (btnNovo) btnNovo.classList.toggle('d-none', !owner);
}

// Mostra modal de login e trata submissão
export function mostrarModalLogin() {
  const modalEl = document.getElementById('loginModal');
  if (!modalEl) {
    console.error('Modal de login não encontrado no HTML.');
    return;
  }

  const modal = new bootstrap.Modal(modalEl, {});
  modal.show();

  const formulario = modalEl.querySelector('#loginForm');
  formulario.reset();

  formulario.onsubmit = (ev) => {
    ev.preventDefault();
    const email = formulario.querySelector('#loginEmail').value.trim().toLowerCase();
    const senha = formulario.querySelector('#loginPassword').value;
    const res = login(email, senha);
    if (res.ok) {
      mostrarToast('Login efetuado com sucesso!', 'success');
      atualizarTituloDaPagina();
      atualizarBotoesAuth();
      // notificar mudança de autenticação para demais módulos
      try { document.dispatchEvent(new CustomEvent('auth:changed')); } catch (e) {}
      setTimeout(() => modal.hide(), 300);
    } else {
      mostrarToast(res.msg || 'Credenciais inválidas.', 'danger');
    }
  };
}

export function inicializarAutenticacao() {
  try {
    const cfg = JSON.parse(localStorage.getItem('store_config') || 'null');
    if (!cfg) {
      mostrarSetupInicial();
    } else {
      atualizarTituloDaPagina();
    }
  } catch (e) {
    localStorage.removeItem('store_config');
    mostrarSetupInicial();
  }
  // atualiza os botões do navbar conforme estado de autenticação
  try { atualizarBotoesAuth(); } catch (e) {}
}
