(function($){
	$.fn.writePortugueseDate = function(){
		var element = $(this[0]);
		var mydate=new Date()
		var year=mydate.getYear()
		if (year<2000)
		year += (year < 1900) ? 1900 : 0
		var day=mydate.getDay()
		var month=mydate.getMonth()
		var daym=mydate.getDate()
		if (daym<10)
		daym="0"+daym
		var dayarray=new Array(
			"Domingo",
			"Segunda-feira",
			"Terça-feira",
			"Quarta-feira",
			"Quinta-feira",
			"Sexta-feira",
			"Sábado"
		);
		var montharray=new Array(
			"de Janeiro de ",
			"de Fevereiro de ",
			"de Março de ",
			"de Abril de ",
			"de Maio de ",
			"de Junho de",
			"de Julho de ",
			"de Agosto de ",
			"de Setembro de ",
			"de Outubro de ",
			"de Novembro de ",
			"de Dezembro de "
		);
		var msg = dayarray[day]+", "+daym+" "+montharray[month]+year;
		element.val(msg);
	};
})(jQuery);

function calculateAge(dateStr){
	var data = new Date();
	var arrayData = dateStr.split('/');
	var ano = parseInt(arrayData[2]);
	var mes = parseInt(arrayData[1],10);
	var dia = parseInt(arrayData[0],10);
	var mesAtual = data.getMonth() + 1;
	var diaAtual = data.getDate();
	var anoAtual = data.getFullYear();
	var idade = anoAtual - ano;
	if (mesAtual < mes) idade--;
	if (mes == mesAtual && diaAtual < dia) idade--;
	return idade;
}

//After page is loaded set actions
$(document).ready(function(){

/*------------------------------Edition and Relation-----------------------------*/
	//Make the urlbase (necessary case SAPeM migrate to another server)
	var urlString = $(location).attr('href');
	var urlArray = urlString.split('/');
	var indexToRunUrlString = 0; 
	var urlbase = '';
	for (indexToRunUrlString in urlArray)
		if (urlArray[indexToRunUrlString] == 'sapem')
			var indexToRecord = indexToRunUrlString;
	for (indexToRunUrlString in urlArray.slice(0,parseInt(indexToRecord,10) + 1))
		if (indexToRunUrlString == 0)
			urlbase += urlArray[indexToRunUrlString];
		else
			urlbase += '/' + urlArray[indexToRunUrlString];
	urlbase += '/';
	//Relation between forms
	//Diagnóstico - Triagem e Exames
	if (urlString.search("edit") != -1){
		var fichaId = urlArray[urlArray.length-2];
		var url = urlbase + 'ficha/' + fichaId + '/';
		$('#form_consulta').append("<input type='hidden' id='edit' name='edit' value='" + fichaId + "'/>");
		var ajaxEdicaoCompleto = false;
		window.setTimeout(function(){$.ajax({
			type: 'POST',
			url: url,
			dataType: "html",
			success: function(text){
				if (window.DOMParser)
				{
					parser=new DOMParser();
					xml=parser.parseFromString(text,"text/xml");
				}else{ // Internet Explorer
					xml=new ActiveXObject("Microsoft.XMLDOM");
					xml.async="false";
					xml.loadXML(text);
				}
				if (xml.getElementsByTagName('error')[0] == undefined){
					var elements = xml.getElementsByTagName('documento')[0].childNodes;
					$(elements).each(function(){
						var el = $(this).get(0);
						if($(el)[0].nodeType == xml.ELEMENT_NODE){
							var tagname = $(el)[0].tagName;
							idDiv = $('#'+tagname).parent().attr('id');
							//console.log(tagname + ' : ' + $('#'+tagname).attr('type'));
							//Checkbox
							if (tagname == 'sexo')
								$('input[name=sexo]').each(function(){
								if ($(el).text().search($(this).val()) != -1)
									$(this).attr('checked',true);
								});
							$('#'+tagname).val($(el).text());
							$('#'+tagname).change();
							ajaxEdicaoCompleto = true;
						}
					});
				}
			},
			complete: function(){
				if (ajaxEdicaoCompleto)
					$('#sida').change();
			}
		});},1000);
	}else{
		var numPaciente = urlArray[urlArray.length-2];
		var numForm = urlArray[urlArray.length-3] - 1;
		var url = urlbase + 'patientLastRegister/' + numForm + '/' + numPaciente + '/';
		$.ajax({
			url: urlbase + 'healthCenter/name/',
			dataType : 'text',
			cache: false,
			success : function(data){
				$('#unidade').val(data);
			}
		});
		$.ajax({
			type: 'POST',
			url: url,
			dataType: "html",
			success: function(text){
				if (window.DOMParser)
				{
					parser=new DOMParser();
					xml=parser.parseFromString(text,"text/xml");
				}else{ // Internet Explorer
					xml=new ActiveXObject("Microsoft.XMLDOM");
					xml.async="false";
					xml.loadXML(text);
				}
				if (xml.getElementsByTagName('error')[0] == undefined){
					//Numero do paciente - Triagem e Exames
					var elements = xml.getElementsByTagName('documento')[0].childNodes;
					$(elements).each(function(){
						var el = $(this).get(0);
						if($(el)[0].nodeType == xml.ELEMENT_NODE){
							var tagname = $(el)[0].tagName;
							idDiv = $('#'+tagname).parent().attr('id');
							//console.log(tagname + ' : ' + $(el).text());
							var hlcolor = '#FFF8C6';
							if (tagname == 'numeroPaciente')
								$('#' + tagname).val($(el).text());
							if (tagname == 'unidade')
								$('#' + tagname).val($(el).text());
						}
					});
				}
			}
		});
	}
/*---------------------------------------------------------------------------------------------------------*/
/* ---------------------------------------- Funcoes Auxiliares	-------------------------------------------*/
	$.fn.showFields = function(argumento){
		var dep = argumento;
		for(div in dep){
			var elems = $('*', dep[div]);
			$(elems).each(function(){
				var element = $(this);
				if (   element[0].nodeName != 'FIELDSET'
					&& element[0].nodeName != 'SMALL'
					&& element[0].nodeName != 'OPTION')
					$(this).addClass('required');
					$(this).removeAttr('disabled',false);
				});
			if($(dep[div]).css('display') != 'block')
				$(dep[div]).toggle(function() {
					$(this).css('background-color', hlcolor);
					$(this).animate({backgroundColor : "white"}, 4000);
					});
		}
	}

	$.fn.hideFields = function(argumento){
		var dep = argumento;
		for(div in dep){
			var elems = $('*', dep[div]);
			$(elems).each(function(){
					var element = $(this);
					if (   element[0].nodeName != 'FIELDSET'
						&& element[0].nodeName != 'SMALL'
						&& element[0].nodeName != 'OPTION')
						$(this).removeClass('required');
					});
			if($(dep[div]).css('display') != 'none')
				$(dep[div]).toggle();
		}
	}
	$.fn.showNotRequiredFields = function(argumento){
		var dep = argumento;
		for(div in dep){
			var elems = $('*', dep[div]);
			$(elems).each(function(){
				var element = $(this);
				if (   element[0].nodeName != 'FIELDSET'
					&& element[0].nodeName != 'SMALL'
					&& element[0].nodeName != 'OPTION')
					$(this).removeAttr('disabled',false);
				});
			if($(dep[div]).css('display') != 'block')
				$(dep[div]).toggle(function() {
					$(this).css('background-color', hlcolor);
					$(this).animate({backgroundColor : "white"}, 4000);
					});
		}
	}

	$.fn.numberWeeks = function(value){
		if (value.search('semana') != -1)
			 return parseInt(value.split('semana')[0]);
		
		if (value.search('meses') != -1)
			return parseInt(value.split('meses')[0]) * 4;

		if (value.search('anos') != -1)
			return parseInt(value.split('anos')[0].split('+')[1]) * 52;

		return 0;
	}

/* --------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/
//Caso o usuario preencha com um numero maior que 12 no
//numero de meses, o numero de anos e incrementado

	$('#numeroMesesFumante').keyup(function(){
		var meses = 0;
		var anos = 0;
		if ($('#numeroMesesFumante').val())
			meses = parseInt($('#numeroMesesFumante').val(),10);
		if ($('#numeroAnosFumante').val())
			anos = parseInt($('#numeroAnosFumante').val(),10);
		if (meses >= 12){
			$('#numeroMesesFumante').val(meses - 12);
			$('#numeroAnosFumante').val(anos + 1);
		}
	});
/*---------------------------------------------------------------------------------------------------------*/
/* ------------------------------------------------ Data Quality ------------------------------------------*/
	//Disables enter
	$("#form_triagem").keypress(function(e) {
		if (e.which == 13) {
			return false;
		}
	});

	//Disables stranges chars for input fields

	$('.text').keypress(function(e){
		if((e.which > 32 && e.which < 65)||
			(e.which > 90 && e.which < 97)||
			(e.which > 122 && e.which < 127)||
			(e.which > 127 && e.which < 192)){
		return false;
		}
	});
	$('.data').datepicker({
		dateFormat: 'dd/mm/yy',
		monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
		monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Aug','Set','Out','Nov','Dez'],
		maxDate: '+0d',
		changeMonth: true,
		changeYear: true,
		maxDate : '+0y',
		minDate : '-130y',
		yearRange : '-130:+130',
		dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
	});
	$('#cep').keypress(function(e){
		if((e.which > 31 && e.which < 48)||(e.which > 57)){
			return false;
		}
	});
	$('.number').keypress(function(e){
		if((e.which > 31 && e.which < 48)||(e.which > 57)){
			return false;
		}
	});

	$('.hour').livequery('keypress', function(e){
		if((e.which > 31 && e.which < 48)||(e.which > 57))
			return false;
		$('.hour').timeEntry({show24Hours: true});
	});

	$('.money').priceFormat({
		prefix: 'R$ ',
		centsSeparator: ',',
		thousandsSeparator: '.',
		centsLimit: 2
	});
/*---------------------------------------------------------------------------------------------------------*/
/*--------------------------------------- Global Variables ------------------------------------------------*/
	var hlcolor = '#FFF8C6';
	var d = new Date()
	var cYear = d.getFullYear();

	//Build birthday calendar
	$('#data_nascimento').datepicker({
			dateFormat: 'dd/mm/yy',
			monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
			monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Aug','Set','Out','Nov','Dez'],
			maxDate: '+0d',
			changeMonth: true,
			changeYear: true,
			maxDate   : '+0y',
			minDate   : '-130y',
			yearRange : '-130:+130',
			dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
			onSelect: function(dateStr){
				var age = calculateAge(dateStr);
				$('#idade').val(age);
				$('#idade').valid();
			}
	});
	//Pick consult date
	$('#data_consulta').datepicker({
			dateFormat: 'dd MM yy',
			monthNames: ['de Janeiro de','de Fevereiro de','de Março de','de Abril de','de Maio de','de Junho de','de Julho de','de Agosto de','de Setembro de','de Outubro de','de Novembro de','de Dezembro de'],
			monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Aug','Set','Out','Nov','Dez'],
			maxDate: '+0d',
			changeMonth: true,
			changeYear: true,
			maxDate   : '+0y',
			minDate   : '-2y',
			yearRange : '-130:+130',
			dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
	});
	$('#dataFimTriagem').datepicker({
			dateFormat: 'dd MM yy',
			monthNames: ['de Janeiro de','de Fevereiro de','de Março de','de Abril de','de Maio de','de Junho de','de Julho de','de Agosto de','de Setembro de','de Outubro de','de Novembro de','de Dezembro de'],
			monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Aug','Set','Out','Nov','Dez'],
			maxDate: '+0d',
			changeMonth: true,
			changeYear: true,
			maxDate   : '+0y',
			minDate   : '-2y',
			yearRange : '-130:+130',
			dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
	});
/*---------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/
	//Autocomplete years fields
	years = new Array();
	for (i=cYear-100; i <=cYear; i++)
		years.push(i.toString());

	$('#data_ultimo_tratamento').autocomplete({
		lookup: years
	});

	$('#data_sida').autocomplete({
		lookup: years
	});
/*---------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/
	//Fill States in 'Estado' selectbox
	$.ajax({
		url: './cgi-bin/autocomplete.py',
		data:({service:'state'}),
		dataType : 'json',
		cache: false,
		success : function(data){
			$.each(data.suggestions, function(i, item){
				$('#estado').append($('<option>'+item+'</option>' )
					.val(item)
				);
			});
		}
	});
	$.ajax({
		url: './cgi-bin/autocomplete.py',
		data:({service:'state'}),
		dataType : 'json',
		cache: false,
		success : function(data){
			$.each(data.suggestions, function(i, item){
				$('#naturalidade').append($('<option>'+item+'</option>' )
					.val(item)
				);
			});
		}
	});
	//Complete everything just with the CEP complete
	$('#cep').keyup(function() {
		var cepForm = $(this).val();
		var format = '#####-###';
		var i = cepForm.length;
		var output = format.substring(0,1);
		var text   = format.substring(i)
		if (text.substring(0,1) != output) $(this).val(cepForm + text.substring(0,1))
		if (cepForm.length == 9){
			$.getJSON('./cgi-bin/autocomplete.py?service=cep&query=' + cepForm, function(json){
				$('#estado').val(json.state);
				$('#cidade').val(json.city);
				$('#endereco').val(json.street);
			});
		}
	});
	//Autocomplete features
	var ajaxOpt;
	//Set options
	ajaxOpt = {
		serviceUrl:'./cgi-bin/autocomplete.py',
		noCache: true
	};
	//autocomplete triggers
	ac_city = $('#cidade').autocomplete(ajaxOpt);
	ac_city.setOptions({params: {service:'city', state:function(){ return $('#estado').val()}}});

	ac_neighborhood = $('#bairro').autocomplete(ajaxOpt);
	ac_neighborhood.setOptions({params: {service:'neighborhood', city:function(){ return $('#cidade').val()}}});

	ac_street = $('#endereco').autocomplete(ajaxOpt);
	ac_street.setOptions({params: {service:'street', city:function(){ return $('#cidade').val()}}});
/*---------------------------------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/
	//hide secondary fields
	$('div.secondary').css('display', 'none');
	$('*', 'div.secondary').each(function(){
		if($(this)[0].nodeName == 'SELECT' || $(this)[0].nodeName == 'INPUT' )
			$(this).attr('disabled', 'disabled');
	});

	$('*', 'div.tempoSinais').each(function(){
		if($(this)[0].nodeName == 'SELECT' || $(this)[0].nodeName == 'INPUT' )
			$(this).attr('disabled', 'disabled');
	});
/*---------------------------------------------------------------------------------------------------------*/
/*------------------------------------  Take care of secondary fields  ------------------------------------*/
	$('.sinais').change(function(){
		elem_id  = $(this).attr('id');
		elem_id = elem_id.charAt(0).toUpperCase() + elem_id.substr(1);
		elem_id = '#tempo' + elem_id;
		if($(this).val() == 'sim'){
			$(elem_id).removeAttr('disabled');
		} else {
			$(elem_id).attr('disabled', true);
		}
	});
	$('#exames').change(function(){
		var dep = new Array();
		dep[0] = '#divOutrosExames';
		if ($(this).val() == 'outro')
			$().showFields(dep);
		else
			$().hideFields(dep);
	});
	$('#tipoUnidade').change(function(){
			var dep1 = new Array();
			dep1[0] = '#divMotivoVindaUnidadeSaude';
			dep1[1] = '#divProcurouUnidadeSaudePorOrientacao';
			var dep2 = new Array();
			dep2[0] = '#divCausasNaoMedicas';
			dep2[1] = '#divCausasMedicas';
			dep2[2] = '#divResponsavelPeloEncaminhamentoParaInternacao';
			if($(this).val()=='ambulatorio'){
				$().showFields(dep1);
				$().hideFields(dep2);
			}else if ($(this).val()=='hospital'){
				$().showFields(dep2);
				$().hideFields(dep1);
			}
	});
	$('#pacienteExcluido').change(function(){
			var dep1 = new Array();
			dep1[0] = '#divDataAssinatura';
			var dep2 = new Array();
			dep2[0] = '#divMotivoPacienteExcluido';
			if($(this).val()=='nao'){
				$().showFields(dep1);
				$().hideFields(dep2);
			}else if ($(this).val()=='sim'){
				$().showFields(dep2);
				$().hideFields(dep1);
			}else{
				$().hideFields(dep1);
				$().hideFields(dep2);
			}
	});

	$('#dispneia').change(function(){
		var dep = new Array();
		dep[0] = '#divFaltaAr';
		dep[1] = '#divCansaco';
		dep[2] = '#divInterrompeuAtividade';
		dep[3] = '#divAcordaSemAr';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim')
			$().showFields(dep);
		else{
			for(div in dep){
				if(dep[div] == '#divAcordaSemAr'){
					if( $('#chiado').val()  == 'sim' ||
						$('#tosse').val()   == 'sim'
					) continue;
				}
				var elems = $('*', dep[div]);
				$(elems).each(function(){
					var element = $(this);
					if (   element[0].nodeName != 'FIELDSET'
						&& element[0].nodeName != 'SMALL'
						&& element[0].nodeName != 'OPTION')
						$(this).removeClass('required');
						$(this).attr('disabled', 'disabled');
				});
				if($(dep[div]).css('display') != 'none')
					$(dep[div]).toggle();
			}
		}
	});
	$('#chiado').change(function(){
		var dep = new Array();
		dep[0] = '#divAcordaSemAr';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim')
			$().showFields(dep);
		else {
			for(div in dep){
				if(dep[div] == '#divAcordaSemAr'){
					if( $('#dispneia').val() == 'sim' ||
						$('#tosse').val()   == 'sim'
					) continue;
				}
				var elems = $('*', dep[div]);
				$(elems).each(function(){
					var element = $(this);
					if (   element[0].nodeName != 'FIELDSET'
						&& element[0].nodeName != 'SMALL'
						&& element[0].nodeName != 'OPTION')
						$(this).removeClass('required');
						$(this).attr('disabled', 'disabled');
				});
				if($(dep[div]).css('display') != 'none')
					$(dep[div]).toggle();
			}
		}
	});
	$('#tosse').change(function(){
		var dep = new Array();
		dep[0] = '#divAcordaSemAr';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim')
			$().showFields(dep);
		else {
			for(div in dep){
				if(dep[div] == '#divAcordaSemAr'){
					if( $('#dispneia').val() == 'sim' ||
						$('#tosse').val()   == 'sim'
					) continue;
				}
				var elems = $('*', dep[div]);
				$(elems).each(function(){
					var element = $(this);
					if (   element[0].nodeName != 'FIELDSET'
						&& element[0].nodeName != 'SMALL'
						&& element[0].nodeName != 'OPTION')
						$(this).removeClass('required');
						$(this).attr('disabled', 'disabled');
				});
				if($(dep[div]).css('display') != 'none')
					$(dep[div]).toggle();
			}
		}
	});
	$('#motivoVindaUnidadeSaude').change(function(){
		var dep = new Array();
		dep[0] = '#divEspecificarMotivoVindaUnidadeSaude';
		if ($(this).val() == 'outros')
			$().showFields(dep);
		else
			$().hideFields(dep);
	});
	$('#tratamentoAnterior').change(function(){
		var dep = new Array();
		dep[0] = '#divQuantasVezesTratouTB';
		dep[1] = '#divDataUltimoTratamento';
		dep[2] = '#divLocalTuberculose';
		dep[3] = '#divDesfecho';

		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim'){
			$().showFields(dep);
			$('#quantasVezesTratouTB').val('');
			$('#data_ultimo_tratamento').val('');
		}
		else
			$().hideFields(dep);
	});
	$('#fumante').change(function(){
		var dep = new Array();
		dep[0] = '#divNumeroCigarros';
		dep[1] = '#divTempoFumante';
		dep[2] = '#divCargaTabagistica';
		var dep1 = new Array();
		dep1[0] = '#divTempoParouFumar';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim'){
			$().showFields(dep);
			$().hideFields(dep1);
		}
		else if ($(this).val() == 'exfumante'){
			$().showFields(dep);
			$().showFields(dep1);
		}
		else{
			$().hideFields(dep);
			$().hideFields(dep1);
		}
	});
	$('#exameSida').change(function(){
		var dep1 = new Array();
		dep1[0] = '#divDataSida';
		dep1[1] = '#divSIDA';
		var dep2 = new Array();
		dep2[0] = '#divSIDAUsoAntiRetroviral';
		dep2[1] = '#divDataInicioUsoRetroviral';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim')
			$().showFields(dep1);
		else{
			$().hideFields(dep1);
			$().hideFields(dep2);
			$('#sida').val('');
		}
	});
	$('#sida').change(function(){
		var dep1 = new Array();
		dep1[0] = '#divSIDAUsoAntiRetroviral';
		var dep2 = new Array();
		dep2[0] = '#divDataInicioUsoRetroviral';
		if($(this).val()=='sim')
			$().showFields(dep1);
		else{
			$().hideFields(dep1);
			$().hideFields(dep2);
		}
	});
	$('#contatoTuberculosePositiva').change(function(){
		var dep1 = new Array();
		dep1[0] = '#divEscarroEraPositivo';
		if ($(this).val()=='sim')
			$().showFields(dep1);
		else
			$().hideFields(dep1);
	});

	$('#sidaUsoAntiRetroviral').change(function(){
		var dep = new Array();
		dep[0] = '#divDataInicioUsoRetroviral';
		if($(this).val()=='sim')
			$().showFields(dep);
		else
			$().hideFields(dep);
	});
	$('#procurouUnidadeSaudePorOrientacao').change(function(){
			var dep = new Array();
			dep[0] = '#divEspecificacaoEncaminhamento';
			if($(this).val()=='encaminhadoPorOutroServicoDeSaude' || $(this).val() == 'outros')
				$().showFields(dep);
			else
				$().hideFields(dep);
	});

/*------------------------------------------------------------------------------------------------*/
/*---------------------------------- Logica  do Emagrecimento ------------------------------------*/
	// Check emagrecimento field
	$('#pesoAtual').change(function(){
		var dep = new Array();
		dep[0] = '#divTempoEmagrecimento';
		var valor = parseInt($(this).val(),10);
		var valorPeso = parseInt($('#pesoHabitual').val(),10);
		if ((valor != 0)&&(valorPeso != 0))
			if (valor < valorPeso)
				$().showNotRequiredFields(dep);
			else{
				$().hideFields(dep);
				$('#emagrecimento').val('Não');
			}
	});
	$('#pesoHabitual').change(function(){
		var dep = new Array();
		dep[0] = '#divTempoEmagrecimento';
		var valor = parseInt($(this).val(),10);
		var valorPeso = parseInt($('#pesoAtual').val(),10);
		if ((valor != 0)&&(valorPeso != 0))
			if (valorPeso < valor)
				$().showNotRequiredFields(dep);
			else{
				$().hideFields(dep);
				$('#emagrecimento').val('Não');
			}
	});
	$('#pesoAtual').change(function(){
		var tempoEmagrecimento = parseInt($('#tempoEmagrecimento').val(),10);
		var percentagem = (parseInt($('#pesoHabitual').val(),10) - parseInt($('#pesoAtual').val(),10))/parseInt($('#pesoHabitual').val(),10);
		if (tempoEmagrecimento >= 1 && tempoEmagrecimento < 3)
			if(percentagem > 0.05)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 3 && tempoEmagrecimento < 6)
			if(percentagem > 0.075)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 6)
			if(percentagem > 0.10)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
	});
	$('#pesoHabitual').change(function(){
		var tempoEmagrecimento = parseInt($('#tempoEmagrecimento').val(),10);
		var percentagem = (parseInt($('#pesoHabitual').val(),10) - parseInt($('#pesoAtual').val(),10))/parseInt($('#pesoHabitual').val(),10);
		if (tempoEmagrecimento >= 1 && tempoEmagrecimento < 3)
			if(percentagem > 0.05)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 3 && tempoEmagrecimento < 6)
			if(percentagem > 0.075)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 6)
			if(percentagem > 0.10)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
	});
	$('#tempoEmagrecimento').change(function(){
		var tempoEmagrecimento = parseInt($('#tempoEmagrecimento').val(),10);
		var percentagem = (parseInt($('#pesoHabitual').val(),10) - parseInt($('#pesoAtual').val(),10))/parseInt($('#pesoHabitual').val(),10);
		if (tempoEmagrecimento >= 1 && tempoEmagrecimento < 3)
			if(percentagem > 0.05)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 3 && tempoEmagrecimento < 6)
			if(percentagem > 0.075)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
		else if (tempoEmagrecimento >= 6)
			if(percentagem > 0.10)
				$('#emagrecimento').val('Sim');
			else
				$('#emagrecimento').val('Não');
	});
/*------------------------------------------------------------------------------------------------*/
/* -------------------------------- Desfecho e Conduta ------------------------------------------ */
	$('#quantasVezesTratouTB').change(function(){
		var prov = new Array();
		prov[0] = '#divProvavelTbResistente';
		prov[1] = '#divCondutaProvavelTbResistente';

		var naoProv = new Array();
		naoProv[0] = '#divNaoProvavelTbResistente';

		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		if (parseInt($(this).val()) > 2 || $('#contatoTuberculoseResistente').val() == 'sim' || $('#sida').val() == 'sim' || $('#permanenciaPrisional').val() == 'sim'){
			$().hideFields(naoProv);
			$().hideFields(consulta);
			$().hideFields(tosse);
			$().hideFields(pulmao);
			$().showNotRequiredFields(prov);
		}
		else{
			$().hideFields(prov);
			$().showNotRequiredFields(naoProv);
			
			if ($().numberWeeks($('#tempoTosse').val()) > 3)
				$().showNotRequiredFields(tosse);
			else
				$().hideFields(tosse);

			if ($('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim')
				$().showNotRequiredFields(pulmao);
			else
				$().hideFields(pulmao);

			if ($('#divCondutaNaoProvavelTbResistente_tosse').attr('style').search('display: none') != -1 && $('#divCondutaNaoProvavelTbResistente_pulmao').attr('style').search('display: none') != -1)
				$().showNotRequiredFields(consulta);
		}
	});

	$('#contatoTuberculoseResistente').change(function(){
		var prov = new Array();
		prov[0] = '#divProvavelTbResistente';
		prov[1] = '#divCondutaProvavelTbResistente';

		var naoProv = new Array();
		naoProv[0] = '#divNaoProvavelTbResistente';

		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		if ($(this).val() == 'sim' || parseInt($('#quantasVezesTratouTB').val()) > 2 || $('#sida').val() == 'sim' || $('#permanenciaPrisional').val() == 'sim'){
			$().hideFields(naoProv);
			$().hideFields(consulta);
			$().hideFields(tosse);
			$().hideFields(pulmao);
			$().showNotRequiredFields(prov);
		}
		else{
			$().hideFields(prov);
			$().showNotRequiredFields(naoProv);
			
			if ($().numberWeeks($('#tempoTosse').val()) > 3)
				$().showNotRequiredFields(tosse);
			else
				$().hideFields(tosse);

			if ($('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim')
				$().showNotRequiredFields(pulmao);
			else
				$().hideFields(pulmao);

			if ($('#divCondutaNaoProvavelTbResistente_tosse').attr('style').search('display: none') != -1 && $('#divCondutaNaoProvavelTbResistente_pulmao').attr('style').search('display: none') != -1)
				$().showNotRequiredFields(consulta);
		}
	});

	$('#sida').change(function(){
		var prov = new Array();
		prov[0] = '#divProvavelTbResistente';
		prov[1] = '#divCondutaProvavelTbResistente';

		var naoProv = new Array();
		naoProv[0] = '#divNaoProvavelTbResistente';

		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		if ($(this).val() == 'sim' || parseInt($('#quantasVezesTratouTB').val()) > 2 || $('#contatoTuberculoseResistente').val() == 'sim' || $('#permanenciaPrisional').val() == 'sim'){
			$().hideFields(naoProv);
			$().hideFields(consulta);
			$().hideFields(tosse);
			$().hideFields(pulmao);
			$().showNotRequiredFields(prov);
		}
		else{
			$().hideFields(prov);
			$().showNotRequiredFields(naoProv);
			
			if ($().numberWeeks($('#tempoTosse').val()) > 3)
				$().showNotRequiredFields(tosse);
			else
				$().hideFields(tosse);

			if ($('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim')
				$().showNotRequiredFields(pulmao);
			else
				$().hideFields(pulmao);

			if ($('#divCondutaNaoProvavelTbResistente_tosse').attr('style').search('display: none') != -1 && $('#divCondutaNaoProvavelTbResistente_pulmao').attr('style').search('display: none') != -1)
				$().showNotRequiredFields(consulta);
		}
	});

	$('#permanenciaPrisional').change(function(){
		var prov = new Array();
		prov[0] = '#divProvavelTbResistente';
		prov[1] = '#divCondutaProvavelTbResistente';

		var naoProv = new Array();
		naoProv[0] = '#divNaoProvavelTbResistente';

		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		if ($(this).val() == 'sim' || parseInt($('#quantasVezesTratouTB').val()) > 2 || $('#contatoTuberculoseResistente').val() == 'sim' || $('#sida').val() == 'sim'){
			$().hideFields(naoProv);
			$().hideFields(consulta);
			$().hideFields(tosse);
			$().hideFields(pulmao);
			$().showNotRequiredFields(prov);
		}
		else{
			$().hideFields(prov);
			$().showNotRequiredFields(naoProv);
			
			if ($().numberWeeks($('#tempoTosse').val()) > 3)
				$().showNotRequiredFields(tosse);
			else
				$().hideFields(tosse);

			if ($('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim')
				$().showNotRequiredFields(pulmao);
			else
				$().hideFields(pulmao);

			if ($('#divCondutaNaoProvavelTbResistente_tosse').attr('style').search('display: none') != -1 && $('#divCondutaNaoProvavelTbResistente_pulmao').attr('style').search('display: none') != -1)
				$().showNotRequiredFields(consulta);
		}
	});

	$('#tempoTosse').change(function(){
		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		// is (Nao provavel TB Resistente) being displayed...?
		provavel = $('#divProvavelTbResistente').attr('style').search('display: none');

		if (provavel != -1){
			if ($().numberWeeks($(this).val()) > 3){
				$().hideFields(consulta);
				$().showNotRequiredFields(tosse);
			}
			else{
				$().hideFields(tosse);
				if ($('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim'){
					$().hideFields(consulta);
					$().showNotRequiredFields(pulmao);
				}
				else{
					$().hideFields(pulmao);
					$().showNotRequiredFields(consulta);
				}
			}
		}
	});

	$('#dispneia').change(function(){
		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		// is (Nao provavel TB Resistente) being displayed...?
		provavel = $('#divProvavelTbResistente').attr('style').search('display: none');

		if (provavel != -1){
			if ($(this).val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim'){
				$().hideFields(consulta);
				$().showNotRequiredFields(pulmao);
			}
			else{
				$().hideFields(pulmao);
				if ($().numberWeeks($('#tempoTosse').val()) > 3){
					$().showNotRequiredFields(tosse);
					$().hideFields(consulta);
				}
				else{
					$().showNotRequiredFields(consulta);
					$().hideFields(tosse);
				}
			}
		}
	});

	$('#chiado').change(function(){
		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		// is (Nao provavel TB Resistente) being displayed...?
		provavel = $('#divProvavelTbResistente').attr('style').search('display: none');

		if (provavel != -1){
			if ($(this).val() == 'sim' || $('#dispneia').val() == 'sim' || $('#acordaSemAr').val() == 'sim' || $('#coriza').val() == 'sim'){
				$().hideFields(consulta);
				$().showNotRequiredFields(pulmao);
			}
			else{
				$().hideFields(pulmao);
				if ($().numberWeeks($('#tempoTosse').val()) > 3){
					$().showNotRequiredFields(tosse);
					$().hideFields(consulta);
				}
				else{
					$().showNotRequiredFields(consulta);
					$().hideFields(tosse);
				}
			}
		}
	});

	$('#acordaSemAr').change(function(){
		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		// is (Nao provavel TB Resistente) being displayed...?
		provavel = $('#divProvavelTbResistente').attr('style').search('display: none');

		if (provavel != -1){
			if ($(this).val() == 'sim' || $('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#coriza').val() == 'sim'){
				$().hideFields(consulta);
				$().showNotRequiredFields(pulmao);
			}
			else{
				$().hideFields(pulmao);
				if ($().numberWeeks($('#tempoTosse').val()) > 3){
					$().showNotRequiredFields(tosse);
					$().hideFields(consulta);
				}
				else{
					$().showNotRequiredFields(consulta);
					$().hideFields(tosse);
				}
			}
		}
	});

	$('#coriza').change(function(){
		var consulta = new Array();
		consulta[0] = '#divCondutaNaoProvavelTbResistente_consulta';

		var tosse = new Array();
		tosse[0] = '#divCondutaNaoProvavelTbResistente_tosse';

		var pulmao = new Array();
		pulmao[0] = '#divCondutaNaoProvavelTbResistente_pulmao';

		// is (Nao provavel TB Resistente) being displayed...?
		provavel = $('#divProvavelTbResistente').attr('style').search('display: none');

		if (provavel != -1){
			if ($(this).val() == 'sim' || $('#dispneia').val() == 'sim' || $('#chiado').val() == 'sim' || $('#acordaSemAr').val() == 'sim'){
				$().hideFields(consulta);
				$().showNotRequiredFields(pulmao);
			}
			else{
				$().hideFields(pulmao);
				if ($().numberWeeks($('#tempoTosse').val()) > 3){
					$().showNotRequiredFields(tosse);
					$().hideFields(consulta);
				}
				else{
					$().showNotRequiredFields(consulta);
					$().hideFields(tosse);
				}
			}
		}
	});
/* ---------------------------------------------------------------------------------------------- */
/*------------------------------------ Logica da Tosse -------------------------------------------*/
	$('#motivoVindaUnidadeSaude').change(function(){
		if ($(this).val() == 'tosse'){
			$('#tosse').val('sim');
			$('#tosse').change();
		}
	});
/*------------------------------------------------------------------------------------------------*/
/*------------------------------------ Logica da Bebida ------------------------------------------*/
	$('#bebida').change(function(){
		var dep = new Array();
		dep[0] = '#divDiminuirQuantidadeBebida';
		dep[1] = '#divCriticasModoBeber';
		dep[2] = '#divBebePelaManha';
		dep[3] = '#divCulpadoManeiraBeber';
		dep[4] = '#divCriterioCage';
		// Se sim, disponibilizar colunas listadas a cima
		if($(this).val()=='sim'){
			$('#criterioCage').val('Negativo');
			$().showFields(dep);
		} else {
			$('#criterioCage').val('');
			$().hideFields(dep);
		}
	});
	//Check bebida field
	$('.criterio_cage').change(function(){
		var indiceCriterioCage = 0;
		var contadorSim = 0;
		var contadorNao = 0;
		while (indiceCriterioCage <= 3)
		{
			if ($('#criterio_cage_' + indiceCriterioCage).val() == 'sim')
				contadorSim++;
			if ($('#criterio_cage_' + indiceCriterioCage).val() == 'nao')
				contadorNao++;
			indiceCriterioCage++;
		}
		if (contadorSim >= 2)
			$('#criterioCage').val('Positivo');
		if (contadorNao > 2)
			$('#criterioCage').val('Negativo');
	});

/*------------------------------------------------------------------------------------------------*/
/*------------------------------- Data Quality with Validate Plugin ------------------------------*/
	$('#form_triagem').validate({
		onkeyup: false,
		onclick: false,
		rules:{
			altura:{
				range : [30, 250],
				validIMC : true,
				warningHeight : true
			},
// JQuery UI calendar confuses the focus and blur events
// The validation will be done directly to the calendar's code
			idade:{
				warningAge: true,
				warningMaritalState: true
			},
			pesoAtual:{
				range : [1, 500],
				validIMC : true,
				warningWeight : true
			},
			pesoHabitual:{
				range : [1, 500]
			},
			estado_civil:{
				warningMaritalState:true
			},
			data_tratamento:{
				minlength: 4,
				GreaterThanBirthYear : true,
				LowerThanCurrentYear: true,
				maxlength: 4
			},
			numeroAnosFumante:{
				CantSmokeFor70Years: true,
				yearsSmokingLowerThanAge: true,
				warningYearsSmoking: true
			},
			numeroCigarros:{
				numberOfCigarrettes: true,
				warningNumberOfCigarrettes: true
			},
			tempoResidenteEstadoAtual:{
				yearsLowerThanAge: true
			},
			cargaTabagistica:{
				max:   500,
				warningCT: true,
				checkCT: true
			},
			avaliacao:{
				max:	10
			},
			data_sida:{
				lowerThanHIVTest:true,
				minlength: 4,
				GreaterThanBirthYear : true,
				LowerThanCurrentYear: true,
				maxlength: 4
			},
			numeroAnosFumante:{
				yearsSmokingLowerThanAge: true,
			},
			tempoTosse:{
				warningSymptoms:'20meses'
			},
			tempoExpectoracao:{
				warningSymptoms:'12meses'
			},
			tempoHemoptoico:{
				warningSymptoms:'16semanas'
			},
			tempoSudorese:{
				warningSymptoms:'24semanas'
			},
			tempoFebre:{
				warningSymptoms:'20semanas'
			},
			tempoDispneia:{
				warningSymptoms:'12meses'
			},
			tempoPerdaDeApetite:{
				warningSymptoms:'14meses'
			}
		}
	});
/*-----------------------------------------------------------------------------------------------*/
});
