# Loja Dinâmica

Pequena loja front-end (SENAI) que permite cadastrar produtos localmente e enviar pedidos via WhatsApp.

Uso rápido:
- Abra `index.html` no navegador (ou sirva com `npx http-server . -p 8080`).
- No primeiro acesso, faça o Setup Inicial (nome, email, senha e WhatsApp — formato `5521...`).
- Cadastre produtos como dono (login) e clientes podem adicionar ao carrinho e clicar em "Finalizar Compra" para abrir o WhatsApp com a mensagem do pedido.

Observações:
- Dados (produtos, config, carrinho) ficam em `localStorage` do navegador — não é seguro para produção.
- Licença: MIT — autor: Davi Nunes.
