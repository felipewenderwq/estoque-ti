# TI Estoque — Sistema de Gestão de Ativos

O TI Estoque é uma solução de gerenciamento local desenvolvida em Node.js para o controle e monitoramento de equipamentos de tecnologia. O sistema permite o cadastramento de itens, gestão de status e o registro histórico de alocações.

## Funcionalidades Principais

* Dashboard: Visualização de métricas, itens em uso e alertas de manutenção.
* Gestão de Equipamentos: Cadastro, edição e descarte de hardware.
* Controle de Alocações: Registro de saída de equipamentos para colaboradores.
* Histórico: Log detalhado de movimentações e responsáveis.

## Usuários e Níveis de Acesso

O sistema possui três usuários padrão configurados via script de setup:

| Usuário | Senha | Perfil | Permissões |
| admin | admin | Administrador | Acesso total (Criar, Editar, Alocar) |
| ti | 2026 | Administrador | Acesso total (Criar, Editar, Alocar) |
| gestor | 2026 | Viewer | Apenas leitura e visualização |

## Tecnologias

* Ambiente: Node.js
* Framework: Express
* Banco de Dados: SQLite
* Frontend: HTML5, CSS3 e JavaScript (Vanilla)

## Estrutura do Projeto

* /public: Arquivos de interface (HTML e CSS).
* /routes: Lógica de autenticação e manipulação de dados.
* setup.js: Script de criação do banco de dados e usuários iniciais.
* index.js: Arquivo principal de execução do servidor.

## Instalação e Execução

1. Instale as dependências necessárias:
   npm install

2. Execute o script de configuração inicial para criar o banco de dados e os usuários:
   node setup.js

3. Inicie o servidor local:
   node server.js

4. Acesse a aplicação através do navegador:
   http://localhost:3000

## Regras de Segurança

* Autenticação: Todas as rotas internas exigem login ativo.
* Autorização: Funções de escrita (POST, PUT, DELETE) são restritas aos perfis de administrador. Usuários com perfil 'viewer' possuem acesso bloqueado a estas operações.

* ### Code for God, not for men — Colossenses 3:23-24
