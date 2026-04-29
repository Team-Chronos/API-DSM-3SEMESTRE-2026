# API DSM 3 SEMESTRE 2026

# Controle de Apontamento de Horas - GSW

<h2 align="center"> Chronos </h2>

<p align="center">
  <a href ="#dor">Dor do cliente</a>  |
  <a href ="#desafio">Desafio</a>  |
  <a href ="#solucao">Solução</a>  |   
  <a href ="#backlog">Backlog do Produto</a>  |
  <a href ="#dor">DoR</a>  |
  <a href ="#dod">DoD</a>  |
  <a href ="#requisitos">Requisitos</a>  |
  <a href ="#instalacao">Manual de Instalação</a> |
  <a href ="#branch">Estratégia de Branch</a>  |
  <a href ="#sprint">Cronograma de Sprints</a>  |
  <a href ="#tecnologias">Tecnologias</a> |
  <a href ="#equipe">Equipe</a> |
</p>

> Status do Projeto: Em andamento ⏳ 
>
> Documentação: [Documentação das Sprints](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?usp=sharing)
> 
> Video do Projeto: <a href ="sprint">Vídeos</a>

## 😢 Dor do Cliente <a id="dor"></a>

O principal dor do cliente está na dificuldade de organizar e gerir a equipe de forma eficiente diante do crescente volume de demandas. A falta de um processo centralizado e a lentidão no fluxo de informações geram gargalos operacionais que quebram a dinâmica do trabalho diário. Essa dispersão não apenas prejudica a autonomia dos colaboradores, mas também tira dos gestores a visibilidade clara sobre o esforço e a capacidade da equipe, reduzindo drasticamente a produtividade geral e impedindo o negócio de escalar seus resultados.

## 🏅 Desafio <a id="desafio"></a>

O desafio consiste em criar um sistema centralizado de apontamento de horas para controlar projetos, clientes e recursos, substituindo registros dispersos (planilhas, mensagens e anotações). O objetivo é organizar o registro de trabalho, dar visibilidade ao esforço gasto, custos envolvidos e valores a serem cobrados, sem exigir que o usuário preencha informações complexas.

## 🏅 Solução <a id="solucao"></a>

A plataforma de apontamento de horas consiste em um sistema centralizado que tem como objetivo organizar e padronizar o registro de atividades, projetos, clientes e recursos em um único ambiente. A solução permitirá que colaboradores registrem de forma simples as horas dedicadas às tarefas, enquanto gestores terão uma visão clara do esforço aplicado em cada projeto, dos custos envolvidos e dos valores a serem faturados.

A plataforma substituirá registros dispersos, como planilhas, mensagens e anotações, reunindo todas as informações em um único sistema que facilita o acompanhamento das atividades, o controle operacional e a geração de relatórios. Além disso, contará com recursos de visualização de dados que auxiliam na tomada de decisão, garantindo maior eficiência, organização e transparência nos processos da empresa.

---

## 📋 Backlog do Produto <a id="backlog"></a>

| Rank | Prioridade | User Story                                                                                                                                                                                                      | Estimativa | Sprint | Status |
| :--: | :--------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------: | :----: | :----: |
|   1  |    Alta    | Como Gestor, eu quero cadastrar novos projetos definindo seu tipo ("alocação" ou "hora fechada"), para que o sistema aplique as regras corretas de acompanhamento.                                        |       7      |    1   |   ✅​   |
|   2  |    Alta    | Como Desenvolvedor, eu quero apontar o tempo gasto selecionando um projeto, o item e a atividade para que o registro do meu esforço seja centralizado e rápido.                                                                             |       5      |    1   |   ✅​   |
|   3  |    Alta    | Como Gestor, eu quero criar tarefas dentro dos projetos e coloca-los em uma hierarquia de "Itens", para que a equipe saiba exatamente onde o esforço deve ser alocado.                                 |       4      |    1   |   ✅​   |
|   4  |    Alta    | Como Administrador do sistema, eu quero cadastrar os profissionais e vinculá-los aos projetos correspondentes, para garantir que cada pessoa só lance horas onde realmente está atuando.                                         |       6      |    1   |   ✅​   |
|   5  |    Alta    | Como Financeiro, eu quero visualizar os projetos que estão sendo desenvolvidos e ver quanto eles estão custando e quanto cada pessoa vai ganhar, para ter um controle de quanto o projeto custa e quanto cada desenvolvedor vai ganhar de acordo com a hora trabalhada. |      5      |    1   |   ✅   |
|   6  |    Média    | Como Gestor, eu quero comparar as horas consumidas em um projeto de "hora fechada" contra o teto estabelecido, para evitar que o esforço ultrapasse o que foi vendido.                                                                             |      6       |    2   |   🔁   |
|   7  |    Média    | Como Gestor (PMO/PO), eu quero acompanhar a capacidade e a distribuição de esforço dos profissionais, para identificar sobrecargas ou ociosidade na equipe.                                                                     |      3       |    2   |   🔁   |
|   8  |    Média   | Como Financeiro, eu quero ter a flexibilidade de variar o valor da hora cobrada de acordo com o perfil do profissional ou o tipo de atividade executada, para atender contratos que possuem essas particularidades.    |      2      |    2   |   🔁   |
|   9  |    Baixa   | Como Gestor, eu quero gerar relatórios de horas consumidas por projetos e por profissionais, para facilitar o acesso a essa informação, podendo ser compartilhada e/ou analisada.                                            |       5      |    3   |   🔁   |
|  10  |    Baixa   | Como Financeiro, eu quero exportar um relatório consolidado com a base de cobrança mensal por cliente e projeto, para realizar o faturamento sem necessidade de retrabalho manual.                                                      |      3       |    3   |   🔁   |
|  11  |    Baixa   | Como gestor quero gerenciar os projetos cadastrados no sistema (criar, editar e visualizar) para manter as informações atualizadas e acompanhar os detalhes de cada projeto de forma eficiente. |       5       |    3   |   🔁   |

---

## DoR (Definition of Ready) and DoD (Definition of Done)
**:link: Clique no link abaixo para visualizar o DoD e o DoR em documentos:** 
> [Definition of Ready and Done](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.0)

## 🏃‍ DoR - Definition of Ready <a id="dor"></a>

* **Mockup/Protótipo:** incluir representação visual da funcionalidade quando aplicável.
* **Descrição clara:** explicar de forma objetiva o que deve ser desenvolvido.
* **Critérios de aceitação:** definir as condições necessárias para considerar a tarefa concluída.
* **Dicionário de dados:** listar campos existentes, seus tipos e descrições.
* **Dependências:** verificar e registrar se a tarefa depende de outra.
* **Mensagens do sistema:** definir mensagens de confirmação, erro e aviso.

## 🏆 DoD - Definition of Done <a id="dod"></a>

* **Funcionalidade implementada:** o desenvolvimento foi realizado conforme a descrição definida no DoR.
* **Critérios de aceitação atendidos:** todos os critérios de aceitação foram validados e aprovados.
* **Validação dos dados:** os campos definidos no dicionário de dados foram implementados corretamente e estão sendo armazenados de forma adequada.
* **Integrações e dependências:** todas as dependências foram atendidas e a funcionalidade não impacta negativamente outras partes do sistema.
* **Testes realizados:** testes manuais executados garantindo que a funcionalidade funciona corretamente.
*  **Estabilidade do sistema:** a funcionalidade não quebra funcionalidades existentes.
*  **Versionamento:** código commitado no repositório com mensagem clara seguindo o padrão definido.

---

## 📝 Requesitos <a id="requisitos"></a>
**:link: Clique no link abaixo para visualizar os requisitos em documentos:** 
> [Requisitos](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.lxgjjl15qtax)

## 🎯 Requisitos Funcionais(RF)

* **RF01** - Gestão de Projetos: O sistema deve permitir o cadastro, edição e inativação de projetos, categorizando-os obrigatoriamente como "Alocação" ou "Hora Fechada".
* **RF02** - Estruturação de Tarefas: O sistema deve permitir a criação de uma hierarquia de "Itens" e "Atividades" dentro de cada projeto.
* **RF03** - Controle de Acessos e Perfis: O sistema deve permitir o cadastro de usuários com diferentes níveis de permissão (ex: Desenvolvedor, Gestor, Financeiro, Administrador) e vinculá-los aos projetos.
* **RF04** - Apontamento de Horas: O sistema deve prover uma interface para que os profissionais registrem suas horas trabalhadas informando a data, projeto, item, atividade e uma descrição opcional.
* **RF05** - Relatórios: O sistema deve gerar relatórios consolidados de horas consumidas e faturamento, permitindo a aplicação de filtros por data, projeto e profissional, com opção de exportação de dados.
* **RF06** - Dashboard de Gestão: O sistema deve exibir um painel centralizado para gestores contendo indicadores de saúde do projeto, totalizadores financeiros e alertas de capacidade da equipe.

## 🎯 Requisitos Não Funcionais(RNF)
* **RNF01** - Performance (Tempo de Resposta): O sistema deve processar e carregar as telas de apontamento de horas e dashboards em um tempo máximo de 3 segundos em condições normais de rede, garantindo a fluidez do trabalho diário. (Ataca a dor da lentidão)
* **RNF02** - Escalabilidade: A arquitetura do sistema deve suportar o crescimento do volume de dados e o acesso simultâneo de múltiplos usuários (ex: 500 conexões simultâneas) sem degradação perceptível da performance. (Ataca a dor de não suportar a demanda)
* **RNF03** - Usabilidade (Eficiência): A interface de apontamento de horas deve ser intuitiva e otimizada, permitindo que o usuário realize seu registro diário com o menor número de cliques possível (ex: máximo de 3 cliques após o login). (Ataca a dor da falta de autonomia e ferramentas dispersas)
* **RNF04** - Segurança e Privacidade: Dados sensíveis de custos, valores hora e faturamento devem ser criptografados no banco de dados e visíveis exclusivamente para os perfis de Gestor, Administrador e Financeiro.
* **RNF05** - Rastreabilidade (Auditoria): O sistema deve registrar logs de todas as alterações críticas, como edição de valores financeiros ou exclusão de horas já apontadas, identificando o usuário e a data da ação.

---

## Manual de Instalação <a id="instalacao"></a>

### Pré-requisitos

- Java JDK 21 ou superior
- Node.js
- Git
- Variáveis de ambiente configuradas para acesso ao banco

### Clonando os repositórios dos micro-serviços

- Serviço Login
```bash
git clone https://github.com/Team-Chronos/API3-servico-login
cd API3-servico-login
```
iniciar src/main/java/br/com/chronos/servicologin/AplicacaoServicoLogin.java

- Serviço Gestão Tarefas
```bash
git clone https://github.com/Team-Chronos/API3-servico-gestao-tarefas
cd API3-servico-login
```
iniciar criarTarefas/criarTarefas/src/main/java/com/criarTarefas/criarTarefas/Application.java

- Serviço Gateway
```bash
git clone https://github.com/Team-Chronos/API3-servico-auth-gateway
cd API3-servico-login
```
iniciar gateway/src/test/java/com/api/gateway/GatewayApplicationTests.java

- Serviço Gestão de Horas
```bash
git clone https://github.com/Team-Chronos/API3-servico-gestao-horas
cd API3-servico-login
```
iniciar controle-horas/src/main/java/com/api/controle_horas/ControleHorasApplication.java

- Serviço Gestão de Projetos
```bash
git clone https://github.com/Team-Chronos/API3-servico-gestao-projetos
cd API3-servico-login
```
iniciar projeto/src/main/java/com/api/projeto/ProjetoApplication.java

- Serviço Gestão de Profissionais
```bash
git clone https://github.com/Team-Chronos/API3-servico-gestao-profissionais
cd API3-servico-login
```
iniciar profissionais/src/main/java/br/com/chronos/profissionais/MsProfissionaisApplication.java

- Serviço Gestão do Financeiro
```bash
git clone https://github.com/Team-Chronos/API3-servico-gestao-financeiro
cd API3-servico-login
```
iniciar src/main/java/com/api/financeiro/FinanceiroApplication.java

## Configuração do Frontend

1. Clonar o Repositório
```bash
git clone https://github.com/Team-Chronos/API-DSM-3SEMESTRE-2026
cd API-DSM-3SEMESTRE-2026
```

2. Instalar dependências
```bash
npm install
```

3. Executar o projeto
```bash
cd frontend
npm run dev
```

A aplicação deverá rodar em:
```
http://localhost:5173
```

---

## 🚀 Estratégia de Branch <a id="branch"></a>

**:link: Clique no link para visualizar a Estratégia de Branch:** 
[Documentação da Estrátegia de Branch](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.tizfg2z79z37)

## 📅 Cronograma de Sprints <a id="sprint"></a>

| Sprint          |    Período    | Vídeo do projeto | Documentação                                     |
| --------------- | :-----------: | ---------------- | ------------------------------------------------ |
| 🔖 **SPRINT 1** | 16/03 - 05/04 | [Vídeo Sprint 1](https://youtu.be/4c6249vc36k) | [Ver Documentação](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.mmvjmyq4cl7s) |
| 🔖 **SPRINT 2** | 13/04 - 03/05 | [Vídeo Sprint 2]() | [Ver Documentação](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.753vbek8aqdn) |
| 🔖 **SPRINT 3** | 11/05 - 31/05 | [Vídeo Sprint 3]() | [Ver Documentação](https://docs.google.com/document/d/1O_trfXtQ8lO5D2ksU1aD-819RmUyD9XAhrF1bne7AYY/edit?tab=t.28xhhcschnkh) |

## 💻 Tecnologias <a id="tecnologias"></a>

<h4 align="center">
 <a href="https://developer.mozilla.org/pt-BR/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"></a>
 <a href="https://developer.mozilla.org/pt-BR/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css&logoColor=white"></a>
 <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/javascript-f7df1e?style=for-the-badge&logo=javascript&logoColor=black"></a>
 <a href="https://nodejs.org/pt"><img src="https://img.shields.io/badge/node.js-80be03?style=for-the-badge&logo=nodedotjs&logoColor=white"></a>
 <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
 <a href="https://www.canva.com/pt_br/"><img src="https://img.shields.io/badge/canva-5257de?style=for-the-badge&logo=canva&logoColor=white"></a>
 <a href="https://www.atlassian.com/software/jira"><img src="https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white"/></a>
 <a href="https://www.mysql.com"><img alt="Static Badge" src="https://img.shields.io/badge/mysql-325f74?style=for-the-badge&logo=mysql&logoColor=white"></a>
 <a href="https://github.com/"><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"/></a>
 <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-white?style=for-the-badge&logo=react&logoColor=white&color=%23087ea4"/></a>
  <a href="https://www.java.com/"><img src="https://img.shields.io/badge/Java-white?style=for-the-badge&logo=openjdk&logoColor=white&color=%23ED8B00"/></a>
  <a href="https://spring.io/projects/spring-boot"><img src="https://img.shields.io/badge/Spring_Boot-white?style=for-the-badge&logo=springboot&logoColor=white&color=%236DB33F"/></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-white?style=for-the-badge&logo=tailwind-css&logoColor=white&color=%2306B6D4"/></a>
</h4>

## 🎓 Equipe <a id="equipe"></a>

<div align="center">
  <table>
    <tr>
      <th>Membro</th>
      <th>Função</th>
      <th>Github</th>
      <th>Linkedin</th>
    </tr>
    <tr>
      <td>Enzo Gabriel</td>
      <td>Product Owner</td>
      <td><a href="https://github.com/EnzoGabrielCode"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/enzo-gabriel-de-paula-8795a8332/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Ana Julia Rubim</td>
      <td>Scrum Master</td>
      <td><a href="https://github.com/anajrubim"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/ana-júlia-rubim-41904234b"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Rafael Sette</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Sette0o0"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/rafael-sette-de-araujo-229b88334/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>João Vitor Moura</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/JoaooMoura"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/joaoomoura"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Gabriel Lázaro</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/gabsact4"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/gabriel-henrique-a1330a26a/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Aline Raquel</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/AlineRaquelC"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/aline-oliveira-60ab6265?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Lucas Marins</td>
      <td>Desenvolvedor</td>
      <td><a href="https://www.github.com/lucasMarinsSantos"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/lucas-gabriel-marins-dos-santos-56b529246?utm_source=share_via&utm_content=profile&utm_medium=member_android"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Enrico Germano</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/EnricoGermano"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/enrico-de-chiara-germano-022894204/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Leonardo da Silva</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/leodaslb"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/leonardo-silva-lopes-aab435283"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
  </table>
</div>



