# Ferramenta de Gestão Automática de Formulários PREM via Interoperabilidade HL7 em Sistemas Hospitalares

## Resumo (Provisório)
Este projeto tem como objetivo o desenvolvimento de uma ferramenta para a disponibilização automática de formulários de Experiência Relatada por Pacientes (PREMs) após a sua interação em ambiente hospitalar.

Esta ferramenta permitirá o envio automático de um _link_ de acesso ao preenchimento de um formulário PREM padronizado aos utentes após eventos clínicos, como consultas, exames ou internamentos, durante um período de tempo limitado, estipulado de acordo com a sua tipologia. Adicionalmente, é pretendido que o processo de reconhecimento do evento em questão seja efetuado recorrendo à captação de informação padronizada presente em mensagens baseadas em normas HL7, procurando garantir a interoperabilidade do sistema desenvolvido em ambiente clínico.

Após a submissão do formulário, as respostas inseridas serão armazenadas juntamente com dados relevantes sobre o evento associado, visando a geração de insights que possibilitem a melhoria da gestão da experiência do paciente e da qualidade dos serviços prestados.

## Estruturação até ao momento

1. Introdução

	1.1. Enquadramento e Motivação
   
		1.1.1. Contexto Histórico
   
   		1.1.2. Relevância dos PREMs e obstáculos à sua implementação
   
	1.2. Solução Proposta e Objetivos
   
	1.3. Abordagem Metodológica

   	1.4. Estrutura da Dissertação

2. Patient Reported Experience Measures

	2.1. PREMs em Portugal

   	2.2. Padrão Americano - HCAHPS

   	2.3. EUROPEP

   	2.4. OCDE PaRIS

3. Sistemas de Informação em Saúde

	3.1. Sistemas de Informação Hospitalares em Portugal

   		3.1.1. Registo de Saúde Eletrónico
   
		3.1.2. SONHO
   
		3.1.3. SClínico Hospitalar

   	3.2. Interoperabilidade em Sistemas de Saúde

		3.2.1. HL7 V2
   
		3.2.2. HL7 FHIR

4. Tecnologias de Recolha de PREMs

   	4.1. Metodologia de Revisão Sistemática

   	4.2. Resultados da Revisão

5. Arquitetura da Solução Proposta

   	5.1. Tecnologias de Desenvolvimento de Aplicações

   		5.1.1. Tecnologias de _Frontend_

		5.1.2. Tecnologias de _Backend_

		5.1.3. Tecnologias de Base de Dados

 	5.2. Arquitetura do Sistema

6. Desenvolvimento do _Software_

7. Análise e Discussão de Resultados

8. Conclusões e Trabalho Futuro


