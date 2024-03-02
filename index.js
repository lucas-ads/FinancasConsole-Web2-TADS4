//Este arquivo simula a tela inicial do sistema

const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const inquirer = require("inquirer");

const crypto = require("crypto");

const myAccount = require("./myAccount");

if (!fs.existsSync("contas")) {
  fs.mkdirSync("contas");
}

executar();

function executar() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "opcao",
        message: "Selecione a opção desejada:",
        choices: ["Fazer login", "Registrar-se"],
      },
    ])
    .then((respostas) => {
      const resp = respostas["opcao"];

      if (resp === "Registrar-se") {
        registrar();
      } else if (resp === "Fazer login") {
        logar();
      }
    })
    .catch((err) => console.log(err));
}

function registrar() {
  inquirer
    .prompt([
      {
        name: "username",
        message:
          "Informe seu username (somente letras, números, hífens e pontos):",
      },
      {
        name: "senha",
        message: "Informe sua senha:",
      },
    ])
    .then((respostas) => {
      const username = respostas["username"];
      const senha = respostas["senha"];

      if (!username || !senha) {
        console.log(chalk.bgRed.black("Informe username e senha!"));
        registrar();
        return;
      }

      criarUsuario(username, senha);
    })
    .catch((err) => console.log(err));
}

function criarUsuario(username, senha) {
  const caminho = path.join("contas", username + ".json");

  if (fs.existsSync(caminho)) {
    console.log(
      chalk.bgRed.black("Este username já está sendo utilizado, tente outro.")
    );
    registrar();
    return;
  }

  const dadosConta = {
    senha: crypto.createHash("sha256").update(senha).digest("hex"),
    saldo: 0,
  };

  fs.writeFileSync(caminho, JSON.stringify(dadosConta));
  console.log(chalk.bgGreen.white("Conta criada com sucesso!"));
  executar();
}

function logar() {
  inquirer
    .prompt([
      {
        name: "username",
        message:
          "Informe seu username (somente letras, números, hífens e pontos):",
      },
      {
        name: "senha",
        message: "Informe sua senha:",
      },
    ])
    .then((respostas) => {
      const username = respostas["username"];
      const senha = respostas["senha"];

      if (!username || !senha) {
        console.log(chalk.bgRed.black("Informe username e senha!"));
        logar();
        return;
      }

      autenticarUsuario(username, senha);
    })
    .catch((err) => console.log(err));
}

function autenticarUsuario(username, senha) {
  const caminho = path.join("contas", username + ".json");
  if (!fs.existsSync(caminho)) {
    console.log(chalk.bgRed.black("Username não existe!"));
    logar();
    return;
  }

  const dadosConta = JSON.parse(fs.readFileSync(caminho, "utf-8"));

  const novoHash = crypto.createHash("sha256").update(senha).digest("hex");

  if (novoHash === dadosConta.senha) {
    console.log(chalk.bgGreen("Usuário autenticado!"));

    //O módulo myAccount simula a tela do usuário logado com as operações disponíveis para o mesmo
    myAccount(username, executar);
  } else {
    console.log(chalk.bgRed.black("Senha incorreta! Tente novamente."));
    logar();
  }
}
