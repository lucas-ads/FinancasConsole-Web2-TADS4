const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const inquirer = require("inquirer");

var caminhoUsuario;
var usuario;

var voltarMenuPrincipal;

function run(username, funcaoMenuPrincipal) {
  const caminho = path.join("contas", username + ".json");

  if (fs.existsSync(caminho)) {
    caminhoUsuario = caminho;
    usuario = username;
    voltarMenuPrincipal = funcaoMenuPrincipal;
    dashboard();
  } else {
    throw new Exception("Usuário não existe!");
  }
}

function dashboard() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "opcao",
        message: "Selecione a opção desejada:",
        choices: ["Consultar Saldo", "Depositar", "Sacar", "Sair"],
      },
    ])
    .then((respostas) => {
      const resp = respostas["opcao"];

      if (resp === "Consultar Saldo") {
        consultaSaldo();
      } else if (resp === "Depositar") {
        deposita();
      } else if (resp === "Sacar") {
        saca();
      } else {
        voltarMenuPrincipal();
      }
    })
    .catch((err) => {
      console.log(err);
      voltarMenuPrincipal();
    });
}

function conta() {
	const dadosConta = JSON.parse(fs.readFileSync(caminhoUsuario, 'utf-8'));
	return dadosConta;
}

function validarNumero(valor){
  if (isNaN(valor)){
    console.log("Digite um número!")
    return false;
  }else if(Math.sign(valor) == -1 ||Math.sign(valor) == 0 || Math.sign(valor) ==-0){
    console.log("Digite um número positivo")
    return false;
  }
  return true;
}

function consultaSaldo() {
	console.log(`Seu saldo é: ` + conta().saldo);
	dashboard();
}

function deposita() {
	inquirer
		.prompt([
			{
				type: 'string',
				name: 'opcao',
				message: 'Digite o valor a ser depositado: ',
			},
		])
		.then((resposta) => {
			const valorDeposito = parseFloat(resposta['opcao']);
      if(!validarNumero(valorDeposito) ){
        dashboard();
        return;
      }
      let contaAtualizada = conta();
			contaAtualizada.saldo += valorDeposito;

			fs.writeFileSync(caminhoUsuario, JSON.stringify(contaAtualizada));

			console.info(`Foi depositado na sua conta ${valorDeposito} com sucesso`);
			dashboard();
      
		})
		.catch((err) => console.log(err));
}

function saca() {
	inquirer
		.prompt([
			{
				type: 'string',
				name: 'opcao',
				message: 'Digite a quantia a ser sacado: ',
			},
		])
		.then((resposta) => {
			const valorDoSaque = parseFloat(resposta['opcao']);
      if(!validarNumero(valorDoSaque) ){
        dashboard();
        return;
      }
			let contaAtualizada = conta();
			contaAtualizada.saldo -= (valorDoSaque);

			if (contaAtualizada.saldo < 0) {
				console.log('Quantia a ser sacado é inferior ao saldo atual da conta, tente novamente');
				dashboard();
        return

			}
      fs.writeFileSync(caminhoUsuario, JSON.stringify(contaAtualizada));
      console.info(
        `Foi sacado esta quantia ${valorDoSaque} na sua conta com sucesso, restando ${contaAtualizada.saldo}`
      );
      dashboard();
			

			
		})
		.catch((err) => console.log(err));
}

module.exports = run;